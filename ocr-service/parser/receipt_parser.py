from __future__ import annotations

import re

from parser.address import extract_address
from parser.date import extract_date, extract_time
from parser.merchant import extract_merchant
from parser.money import extract_money
from parser.payment import extract_payment
from schemas.receipt import ReceiptExtraction

CATEGORIES = {
    "Groceries": [
        "grocery", "market", "kroger", "heb", "walmart", "wm super", "supercenter",
        "target", "costco", "safeway", "whole foods", "trader joe", "aldi", "publix",
        "yogurt", "produce", "banana",
    ],
    "Restaurants": [
        "restaurant", "cafe", "coffee", "starbucks", "mcdonald", "chipotle",
        "pizza", "pizzatwist", "doordash", "wings", "pasta", "grill", "diner",
    ],
    "Transportation": [
        "uhaul", "u-haul", "shell", "exxon", "chevron", "gas", "fuel", "uber",
        "lyft", "parking",
    ],
    "Healthcare": ["pharmacy", "cvs", "walgreens", "clinic", "hospital", "laborator", "labs", "acupath"],
    "Shopping": ["amazon", "best buy", "store", "mall"],
    "Travel": ["hotel", "airline", "airport"],
}


def categorize(merchant: str, text: str) -> str:
    haystack = f"{merchant} {text}".lower()
    for category, keywords in CATEGORIES.items():
        if any(keyword in haystack for keyword in keywords):
            return category
    return "Other"


def parse_receipt(ocr_text: str, ocr_confidence: float = 0.0) -> ReceiptExtraction:
    """Primary structured parse from Tesseract text."""
    lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]
    merchant = extract_merchant(lines, ocr_text)
    money = extract_money(ocr_text)
    payment = extract_payment(ocr_text)

    return ReceiptExtraction(
        merchantName=merchant,
        merchantAddress=extract_address(ocr_text),
        transactionDate=extract_date(ocr_text),
        transactionTime=extract_time(ocr_text),
        subtotal=money["subtotal"],
        taxAmount=money["taxAmount"],
        tipAmount=money["tipAmount"],
        totalAmount=money["totalAmount"],
        previousBalance=money.get("previousBalance"),
        balanceDue=money.get("balanceDue"),
        currency="USD",
        referenceNumber=_extract_reference(ocr_text),
        paymentMethod=payment["paymentMethod"],
        lastFourDigits=payment["lastFourDigits"],
        cardBrand=payment["cardBrand"],
        category=categorize(merchant, ocr_text),
        items=[],
        confidence=min(ocr_confidence or 0.55, 0.85),
        rawText=ocr_text,
        parserSource="tesseract",
    )


def _extract_reference(text: str) -> str | None:
    match = re.search(
        r"reference\s*(?:number|no\.?|#)?\s*[:#]?\s*(\d{6,})",
        text,
        re.I,
    )
    return match.group(1) if match else None

