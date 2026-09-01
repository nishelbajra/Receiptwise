from __future__ import annotations

import json
import logging
import os
import re
import urllib.error
import urllib.request

from schemas.receipt import ReceiptExtraction

logger = logging.getLogger(__name__)

MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

PROMPT = """You fill ONLY missing receipt fields. Tesseract already parsed the receipt.
Do not overwrite values that are already present unless they are clearly wrong.

Return JSON with:
merchantName, merchantAddress, transactionDate (YYYY-MM-DD), transactionTime,
subtotal, taxAmount, tipAmount, totalAmount, previousBalance, balanceDue,
referenceNumber, currency, paymentMethod,
lastFourDigits (exactly 4 digits or null), cardBrand, category, items, confidence.

On payment confirmations: today's payment / amount paid is totalAmount,
previous balance is previousBalance, new balance is balanceDue.
Card detection is critical: VISA/MASTERCARD/AMEX/DISCOVER and last 4 digits.
Category must be one of: Groceries, Restaurants, Shopping, Transportation,
Entertainment, Healthcare, Utilities, Travel, Education, Other.
"""


def _enabled() -> bool:
    return os.getenv("ENABLE_GEMINI", "false").lower() in {"1", "true", "yes"}


def enhance_with_gemini(ocr_text: str, primary: ReceiptExtraction) -> ReceiptExtraction | None:
    """Secondary extractor. Returns None if Gemini is off or unavailable."""
    if not _enabled():
        return None

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.info("Gemini skipped: GEMINI_API_KEY not set")
        return None

    payload = {
        "contents": [{
            "parts": [{
                "text": (
                    f"{PROMPT}\n\nCURRENT PARSE:\n{primary.model_dump_json()}\n\n"
                    f"OCR TEXT:\n{ocr_text[:8000]}"
                )
            }]
        }],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }
    body = json.dumps(payload).encode("utf-8")

    for model in MODELS:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            cleaned = re.sub(r"```json|```", "", text).strip()
            match = re.search(r"\{[\s\S]*\}", cleaned)
            parsed = json.loads(match.group(0) if match else cleaned)
            logger.info("Gemini secondary parse used model=%s", model)
            return ReceiptExtraction.model_validate(parsed)
        except Exception as exc:
            logger.warning("Gemini model %s failed: %s", model, exc)

    return None
