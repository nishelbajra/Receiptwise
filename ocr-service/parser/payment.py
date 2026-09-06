from __future__ import annotations

import re

_BRANDS = [
    (re.compile(r"discover|tscover|discov", re.I), "DISCOVER"),
    (re.compile(r"\bv[il1]sa\b", re.I), "VISA"),
    (re.compile(r"\bmaster\s*card\b|\bmastercard\b|\bmaster\b", re.I), "MASTERCARD"),
    (re.compile(r"\bamex\b|\bamerican\s*express\b", re.I), "AMEX"),
    (re.compile(r"\bdebit\b", re.I), "DEBIT"),
    (re.compile(r"\bcash\b", re.I), "CASH"),
]

_LAST_FOUR = [
    re.compile(
        r"(?:v[il1]sa|mastercard|master\s*card|amex|american\s*express|discover|tscover|debit)"
        r"[^\d]{0,20}(\d{4})\b",
        re.I,
    ),
    re.compile(r"(?:\*{2,}|x{2,}|\u2022{2,}|ending\s*(?:in|:)|last\s*4)\s*(\d{4})\b", re.I),
    re.compile(r"(?:card|acct|account|tender|tend|purchase|paid\s*by)[^\d]{0,24}(\d{4})\b", re.I),
    re.compile(r"(?:\d{4}[\s-]){3}(\d{4})\b"),
    re.compile(r"(?:xxxx[\s-]?){3}(\d{4})\b", re.I),
    re.compile(r"\b(\d{4})\s+\d{1,2}\s+APP", re.I),
]

_YEAR_LIKE = re.compile(r"^(19|20)\d{2}$")
_BLOCKED = {"0000"}


def _usable_last_four(value: str | None) -> str | None:
    if not value or not re.fullmatch(r"\d{4}", value):
        return None
    if value in _BLOCKED or _YEAR_LIKE.fullmatch(value):
        return None
    return value


def extract_payment(text: str) -> dict:
    normalized = (
        text.replace("TSCOVER", "DISCOVER")
        .replace("tscover", "discover")
        .replace("VlSA", "VISA")
        .replace("vlsa", "visa")
    )
    payment_method = None
    card_brand = None
    for regex, brand in _BRANDS:
        if regex.search(normalized):
            payment_method = brand
            if brand not in {"CASH", "DEBIT"}:
                card_brand = brand
            break

    last_four = None
    for pattern in _LAST_FOUR:
        match = pattern.search(normalized)
        if match:
            last_four = _usable_last_four(match.group(1))
            if last_four:
                break

    if last_four and not payment_method:
        payment_method = card_brand or "OTHER"

    return {
        "paymentMethod": payment_method,
        "lastFourDigits": last_four,
        "cardBrand": card_brand,
    }
