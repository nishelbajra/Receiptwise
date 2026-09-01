from __future__ import annotations

import logging
import os
import shutil

import pytesseract
from PIL import Image

from ocr.preprocessing import preprocess_image

logger = logging.getLogger(__name__)

KEYWORDS = (
    "subtotal", "total", "tax", "walmart", "supercenter", "discover",
    "visa", "mastercard", "purchase", "change", "tend", "appr",
    "payment", "balance", "previous", "laborator",
)


def resolve_tesseract_cmd() -> str:
    candidates = [
        shutil.which("tesseract"),
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
        "/usr/bin/tesseract",
    ]
    for path in candidates:
        if path and os.path.isfile(path) and os.access(path, os.X_OK):
            return path
    return "tesseract"


pytesseract.pytesseract.tesseract_cmd = resolve_tesseract_cmd()


def _score_text(text: str) -> int:
    lower = text.lower()
    return sum(8 for word in KEYWORDS if word in lower) + min(len(text), 2000) // 40


def _lines_from_data(data: dict) -> tuple[list[dict], float]:
    extracted_lines = []
    current_line = []
    current_line_num = -1
    total_confidence = 0.0
    conf_count = 0

    n = len(data.get("text", []))
    for i in range(n):
        text = (data["text"][i] or "").strip()
        if not text:
            continue
        try:
            conf = float(data["conf"][i])
        except (TypeError, ValueError):
            conf = -1
        if conf < 20:
            continue

        line_num = data["line_num"][i]
        if line_num != current_line_num:
            if current_line:
                extracted_lines.append({
                    "text": " ".join(current_line),
                    "confidence": (total_confidence / conf_count) if conf_count else 0,
                    "bbox": [],
                })
            current_line = [text]
            current_line_num = line_num
            total_confidence = conf
            conf_count = 1
        else:
            current_line.append(text)
            total_confidence += conf
            conf_count += 1

    if current_line:
        extracted_lines.append({
            "text": " ".join(current_line),
            "confidence": (total_confidence / conf_count) if conf_count else 0,
            "bbox": [],
        })

    avg = 0.0
    if extracted_lines:
        avg = sum(line["confidence"] for line in extracted_lines) / len(extracted_lines) / 100
    return extracted_lines, round(avg, 3)


def _ocr_with_config(image: Image.Image, config: str) -> tuple[str, list[dict], float]:
    data = pytesseract.image_to_data(
        image,
        config=config,
        output_type=pytesseract.Output.DICT,
    )
    lines, confidence = _lines_from_data(data)
    full_text = "\n".join(line["text"] for line in lines)
    if len(full_text.strip()) < 10:
        full_text = pytesseract.image_to_string(image, config=config).strip()
        lines = [
            {"text": line.strip(), "confidence": 50, "bbox": []}
            for line in full_text.split("\n")
            if line.strip()
        ]
        confidence = 0.5 if lines else 0.0
    return full_text, lines, confidence


def run_ocr(image: Image.Image) -> dict:
    """Primary OCR: try several Tesseract layouts and keep the most receipt-like text."""
    processed = preprocess_image(image)
    logger.info("Tesseract OCR size=%sx%s", processed.size[0], processed.size[1])

    best = {"full_text": "", "lines": [], "confidence": 0.0, "score": -1}
    for psm in (6, 4, 3):
        config = f"--oem 3 --psm {psm} -l eng"
        try:
            text, lines, confidence = _ocr_with_config(processed, config)
        except Exception as exc:
            logger.warning("Tesseract psm %s failed: %s", psm, exc)
            continue
        score = _score_text(text)
        logger.info("psm %s score=%s lines=%s", psm, score, len(lines))
        if score > best["score"]:
            best = {
                "full_text": text,
                "lines": lines,
                "confidence": confidence,
                "score": score,
            }

    logger.info("Tesseract kept %s lines (confidence=%.2f)", len(best["lines"]), best["confidence"])
    return {
        "full_text": best["full_text"],
        "lines": best["lines"],
        "confidence": best["confidence"],
    }


def tesseract_version() -> str:
    return str(pytesseract.get_tesseract_version())
