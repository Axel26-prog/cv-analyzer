from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_text

app = FastAPI(title="CV Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "CV Analyzer API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_cv(file: UploadFile = File(...)):
    # Validar tipo de archivo
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(
            status_code=400,
            detail="Solo se aceptan archivos PDF o DOCX"
        )
    
    # Validar tamaño (máx 5MB)
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="El archivo no puede superar 5MB"
        )
    
    # Extraer texto
    try:
        text = extract_text(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:300],
        "full_text": text
    }