from __future__ import annotations

import re
from datetime import datetime

_MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def _body(text: str) -> str:
    lines = text.splitlines()
    if lines and re.match(r"^\d{1,2}:\d{2}\b", lines[0]) and re.search(r"\b5g\b|leasing|screenshot", lines[0], re.I):
        return "\n".join(lines[1:])
    if lines and re.match(r"^\d{1,2}:\d{2}\s", lines[0]):
        return "\n".join(lines[1:])
    return text


def extract_date(text: str) -> str:
    text = _body(text)
    match = re.search(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b", text)
    if match:
        month, day, year = match.groups()
        if len(year) == 2:
            year = f"20{year}"
        if _valid(int(month), int(day), int(year)):
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

    match = re.search(
        r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s*(\d{4})?",
        text,
        re.I,
    )
    if match:
        month = _MONTHS[match.group(1)[:3].lower()]
        day = int(match.group(2))
        if day > 31:
            day = int(str(day)[-1]) or 1
        year = int(match.group(3) or datetime.now().year)
        if _valid(month, day, year):
            return f"{year}-{month:02d}-{day:02d}"

    match = re.search(r"\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b", text)
    if match:
        year, month, day = match.groups()
        if _valid(int(month), int(day), int(year)):
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

    return datetime.now().strftime("%Y-%m-%d")


def extract_time(text: str) -> str | None:
    text = _body(text)
    match = re.search(
        r"(?:placed at|printed|due at)?[^\n]{0,20}\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)\b",
        text,
        re.I,
    )
    if not match:
        match = re.search(r"\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)\b", text, re.I)
    if not match:
        return None
    hours = int(match.group(1))
    minutes = match.group(2)
    ampm = (match.group(4) or "").lower()
    if ampm == "pm" and hours != 12:
        hours += 12
    if ampm == "am" and hours == 12:
        hours = 0
    if hours > 23:
        return None
    return f"{hours:02d}:{minutes}"


def _valid(month: int, day: int, year: int) -> bool:
    return 1 <= month <= 12 and 1 <= day <= 31 and 2000 <= year <= 2099
