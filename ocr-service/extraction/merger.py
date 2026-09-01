from __future__ import annotations

from schemas.receipt import ReceiptExtraction

VALID_CATEGORIES = {
    "Groceries",
    "Restaurants",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Healthcare",
    "Utilities",
    "Travel",
    "Education",
    "Other",
}


def _empty(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and not value.strip():
        return True
    if isinstance(value, (int, float)) and value == 0:
        return True
    if isinstance(value, list) and not value:
        return True
    return False


def merge_extractions(primary: ReceiptExtraction, secondary: ReceiptExtraction | None) -> ReceiptExtraction:
    """Tesseract/parser is primary. Gemini only fills missing fields."""
    if secondary is None:
        primary.parserSource = "tesseract"
        return primary

    data = primary.model_dump()
    extra = secondary.model_dump()

    fillable = [
        "merchantName",
        "merchantAddress",
        "transactionDate",
        "transactionTime",
        "subtotal",
        "taxAmount",
        "tipAmount",
        "totalAmount",
        "previousBalance",
        "balanceDue",
        "referenceNumber",
        "paymentMethod",
        "lastFourDigits",
        "cardBrand",
        "category",
        "items",
    ]

    filled = False
    for field in fillable:
        if field == "merchantName" and data.get(field) in {"Unknown Merchant", ""}:
            if extra.get(field):
                data[field] = extra[field]
                filled = True
            continue
        if _empty(data.get(field)) and not _empty(extra.get(field)):
            data[field] = extra[field]
            filled = True

    if extra.get("lastFourDigits") and not data.get("lastFourDigits"):
        data["lastFourDigits"] = extra["lastFourDigits"]
        filled = True
    if extra.get("cardBrand") and not data.get("cardBrand"):
        data["cardBrand"] = extra["cardBrand"]
        filled = True

    category = data.get("category") or "Other"
    data["category"] = category if category in VALID_CATEGORIES else "Other"
    data["parserSource"] = "merged" if filled else "tesseract"
    if isinstance(data.get("confidence"), (int, float)):
        data["confidence"] = max(float(data["confidence"]), float(extra.get("confidence") or 0))

    return ReceiptExtraction.model_validate(data)
