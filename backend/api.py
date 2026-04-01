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

from passlib.context import CryptContext
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Password hashing setup
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def generate_verification_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def send_verification_email(email: str, username: str, code: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"DEBUG: No SMTP credentials. Verification code for {email}: {code}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.MAIL_FROM
        msg['To'] = email
        msg['Subject'] = "Orion - Verify Your Email"

        body = f"""
        <html>
            <body style="font-family: sans-serif; background-color: #050510; color: #fff; padding: 20px;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #ffffff10; padding: 30px; border-radius: 20px; background-color: #080815;">
                    <h1 style="color: #a855f7; font-family: 'Orbitron', sans-serif;">ORION</h1>
                    <p>Hello {username},</p>
                    <p>Welcome to the cosmic command center. Please use the code below to verify your email address:</p>
                    <div style="background-color: #ffffff05; padding: 15px; text-align: center; border-radius: 10px; border: 1px solid #ffffff10; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #60a5fa;">{code}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")
        print(f"DEBUG: Falling back to console logging. Verification code for {email}: {code}")

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class VerifyRequest(BaseModel):
    email: str
    code: str

@app.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.username == request.username) | (models.User.email == request.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")

    code = generate_verification_code()
    hashed_pwd = get_password_hash(request.password)
    
    new_user = models.User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_pwd,
        verification_code=code,
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    send_verification_email(request.email, request.username, code)
    
    return {"message": "User registered. Please verify your email.", "email": request.email}

@app.post("/verify")
async def verify(request: VerifyRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.verification_code == request.code:
        user.is_verified = True
        user.verification_code = None
        db.commit()
        return {"message": "Email verified successfully"}
    
    raise HTTPException(status_code=400, detail="Invalid verification code")

@app.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Check if it's the master admin set in env (for legacy support during transition)
    if request.username == settings.APP_USERNAME and request.password == settings.APP_PASSWORD:
        return {"status": "success", "username": request.username}
        
    user = db.query(models.User).filter(models.User.username == request.username).first()
    
    if user:
        if not user.is_verified:
            raise HTTPException(status_code=401, detail="Please verify your email first")
            
        if verify_password(request.password, user.hashed_password):
            return {"status": "success", "username": user.username, "email": user.email}
            
    raise HTTPException(status_code=401, detail="Invalid username or password")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
        "id": new_analysis.id,
        "summary": stats
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
