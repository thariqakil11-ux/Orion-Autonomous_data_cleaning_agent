from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json

from autonomous_data_cleaning_agent_backend import run_pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
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
async def process_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    outputs = run_pipeline(file_path, OUTPUT_DIR)

    return {
        "message": "Processing complete",
        "outputs": outputs
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
