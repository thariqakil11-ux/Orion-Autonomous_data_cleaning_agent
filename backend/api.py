from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json

from autonomous_data_cleaning_agent_backend import run_pipeline
from config import settings
from pydantic import BaseModel
from database import engine, get_db, SessionLocal
import models
from sqlalchemy.orm import Session
from fastapi import Depends

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
async def login(request: LoginRequest):
    if request.username == settings.APP_USERNAME and request.password == settings.APP_PASSWORD:
        return {"status": "success", "username": request.username}
    raise HTTPException(status_code=401, detail="Invalid username or password")

app.add_middleware(

    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.getcwd()
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


VIEWABLE_EXTENSIONS = {
    ".html": "html",
    ".txt": "text",
    ".json": "json"
}


@app.post("/process")
async def process_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    outputs = run_pipeline(file_path, OUTPUT_DIR)

    # Save to history
    stats_file = outputs.get("summary_stats")
    stats = {}
    if stats_file:
        stats_path = os.path.join(OUTPUT_DIR, stats_file)
        if os.path.exists(stats_path):
            with open(stats_path, "r", encoding="utf-8") as f:
                stats = json.load(f)

    new_analysis = models.AnalysisHistory(
        filename=file.filename,
        health_score=stats.get("overview", {}).get("healthScore", 0),
        rows=stats.get("overview", {}).get("rows", 0),
        columns=stats.get("overview", {}).get("columns", 0),
        cleaned_data_path=outputs.get("cleaned_data"),
        eda_report_path=outputs.get("eda_report"),
        summary_stats_path=outputs.get("summary_stats"),
        business_summary_path=outputs.get("business_summary"),
        summary_json=stats
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return {
        "message": "Processing complete",
        "outputs": outputs,
        "id": new_analysis.id
    }


@app.get("/outputs")
def list_outputs():
    files = []

    for fname in os.listdir(OUTPUT_DIR):
        ext = os.path.splitext(fname)[1]
        files.append({
            "name": fname,
            "viewable": ext in VIEWABLE_EXTENSIONS,
            "type": VIEWABLE_EXTENSIONS.get(ext, "download")
        })

    return files


@app.get("/view/{file_name}")
def view_file(file_name: str):
    file_path = os.path.join(OUTPUT_DIR, file_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    ext = os.path.splitext(file_name)[1]

    if ext == ".html":
        return HTMLResponse(open(file_path, encoding="utf-8").read())

    if ext == ".txt":
        return PlainTextResponse(open(file_path, encoding="utf-8").read())

    if ext == ".json":
        return JSONResponse(json.load(open(file_path, encoding="utf-8")))

    raise HTTPException(status_code=400, detail="File not viewable")


@app.get("/download/{file_name}")
def download_file(file_name: str):
    file_path = os.path.join(OUTPUT_DIR, file_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, filename=file_name)


@app.get("/history")
def list_history(db: Session = Depends(get_db)):
    history = db.query(models.AnalysisHistory).order_by(models.AnalysisHistory.timestamp.desc()).all()
    return history
