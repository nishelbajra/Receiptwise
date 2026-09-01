from __future__ import annotations

import base64
import io
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image

from extraction.gemini import enhance_with_gemini
from extraction.merger import merge_extractions
from ocr.tesseract import run_ocr, tesseract_version
from parser.receipt_parser import parse_receipt
from validation.receipt_validator import validate_receipt

logger = logging.getLogger(__name__)
router = APIRouter()


def _image_from_bytes(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data))


def extract_receipt_from_image(image: Image.Image) -> dict:
    ocr_result = run_ocr(image)
    text = (ocr_result.get("full_text") or "").strip()
    if len(text) < 10:
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the image. Please upload a clearer receipt photo.",
        )

    primary = parse_receipt(text, ocr_result.get("confidence") or 0)
    secondary = enhance_with_gemini(text, primary)
    merged = merge_extractions(primary, secondary)
    validated = validate_receipt(merged)

    payload = validated.model_dump()
    payload["ocrConfidence"] = ocr_result.get("confidence")
    payload["lines"] = ocr_result.get("lines") or []
    return payload


@router.get("/")
def root():
    return {
        "service": "tesseract",
        "parser": "tesseract-primary",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
        "extract": "POST /extract-receipt or POST /extract-receipt/base64",
    }


@router.get("/health")
def health():
    try:
        return {
            "status": "ok",
            "service": "tesseract",
            "parser": "tesseract-primary",
            "version": tesseract_version(),
        }
    except Exception as exc:
        return {"status": "error", "service": "tesseract", "error": str(exc)}


@router.post("/ocr")
async def ocr_file(file: UploadFile = File(...)):
    try:
        image = _image_from_bytes(await file.read())
        return run_ocr(image)
    except Exception as exc:
        logger.error("OCR error: %s", exc)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {exc}")


@router.post("/ocr/base64")
async def ocr_base64(payload: dict):
    try:
        image_data = payload.get("image")
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        image = _image_from_bytes(base64.b64decode(image_data))
        return run_ocr(image)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("OCR error: %s", exc)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {exc}")


@router.post("/extract-receipt")
async def extract_receipt_file(file: UploadFile = File(...)):
    try:
        image = _image_from_bytes(await file.read())
        return extract_receipt_from_image(image)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Extract error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Receipt extraction failed: {exc}")


@router.post("/extract-receipt/base64")
async def extract_receipt_base64(payload: dict):
    try:
        image_data = payload.get("image")
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        image = _image_from_bytes(base64.b64decode(image_data))
        return extract_receipt_from_image(image)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Extract error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Receipt extraction failed: {exc}")
