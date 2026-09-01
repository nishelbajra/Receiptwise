import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from ocr.tesseract import tesseract_version

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="ReceiptWise OCR Service", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting Tesseract-primary OCR service...")
    try:
        logger.info("Tesseract version: %s", tesseract_version())
        logger.info("Service ready!")
    except Exception as exc:
        logger.error("Tesseract not found: %s", exc)
        logger.error("Install with: brew install tesseract")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
