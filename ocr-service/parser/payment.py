from __future__ import annotations

import re

_BRANDS = [
    (re.compile(r"discover|tscover|discov", re.I), "DISCOVER"),
    (re.compile(r"\bvisa\b", re.I), "VISA"),
    (re.compile(r"\bmaster\s*card\b|\bmastercard\b", re.I), "MASTERCARD"),
    (re.compile(r"\bamex\b|\bamerican\s*express\b", re.I), "AMEX"),
    (re.compile(r"\bdoordash\b|p[o0]ordash", re.I), "OTHER"),
    (re.compile(r"\bdebit\b", re.I), "DEBIT"),
    (re.compile(r"\bcash\b", re.I), "CASH"),
]

_LAST_FOUR = [
    re.compile(r"(?:discover|tscover|visa|mastercard|amex|debit)[^\d]{0,8}(\d{4})\b", re.I),
    re.compile(r"(?:\*{3,}|x{3,}|ending\s*(?:in|:))\s*(\d{4})\b", re.I),
    re.compile(r"(?:card|acct|account|tender|tend)[^\d]{0,16}(\d{4})\b", re.I),
]


def extract_payment(text: str) -> dict:
    normalized = text.replace("TSCOVER", "DISCOVER").replace("tscover", "discover")
    payment_method = None
    card_brand = None
    for regex, brand in _BRANDS:
        if regex.search(normalized):
            payment_method = brand
            if brand not in ("CASH", "DEBIT"):
                card_brand = brand
            break

    last_four = None
    for pattern in _LAST_FOUR:
        match = pattern.search(normalized)
        if match and re.fullmatch(r"\d{4}", match.group(1)):
            last_four = match.group(1)
            break

    # Walmart style: DISCOVER- 4645  or  4645 11 APPR
    if not last_four:
        match = re.search(r"\b(discover|visa|mastercard|amex)[^\n]{0,20}?(\d{4})\b", normalized, re.I)
        if match:
            last_four = match.group(2)
        else:
            match = re.search(r"\b(\d{4})\s+\d{1,2}\s+APP", normalized, re.I)
            if match:
                last_four = match.group(1)

    if last_four and not payment_method:
        payment_method = card_brand or "OTHER"

    return {
        "paymentMethod": payment_method,
        "lastFourDigits": last_four,
        "cardBrand": card_brand,
    }
