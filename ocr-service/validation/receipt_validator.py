from __future__ import annotations

import re

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


def validate_receipt(receipt: ReceiptExtraction) -> ReceiptExtraction:
    """Normalize fields after parse. Does not invent financial values."""
    receipt.merchantName = (receipt.merchantName or "Unknown Merchant").strip()[:80]

    if receipt.merchantAddress:
        receipt.merchantAddress = re.sub(r"\s+", " ", receipt.merchantAddress).strip()

    if not receipt.transactionDate or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", receipt.transactionDate):
        from datetime import datetime
        receipt.transactionDate = datetime.now().strftime("%Y-%m-%d")

    if receipt.transactionTime and not re.fullmatch(r"\d{2}:\d{2}", receipt.transactionTime):
        receipt.transactionTime = None

    if receipt.lastFourDigits and not re.fullmatch(r"\d{4}", receipt.lastFourDigits):
        receipt.lastFourDigits = None

    if receipt.cardBrand:
        receipt.cardBrand = receipt.cardBrand.upper()
        if receipt.cardBrand not in {"VISA", "MASTERCARD", "AMEX", "DISCOVER"}:
            receipt.cardBrand = None

    if receipt.category not in VALID_CATEGORIES:
        receipt.category = "Other"

    receipt.totalAmount = float(receipt.totalAmount or 0)
    receipt.currency = receipt.currency or "USD"
    receipt.confidence = max(0.0, min(float(receipt.confidence or 0), 1.0))
    return receipt
