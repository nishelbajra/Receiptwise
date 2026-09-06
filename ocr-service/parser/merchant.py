from __future__ import annotations

import re

KNOWN_MERCHANTS = [
    (re.compile(r"acupath|laboratories,\s*inc", re.I), "Acupath Laboratories"),
    (re.compile(r"pizza\s*tw[il1]st|pizzatwist", re.I), "Pizza Twist"),
    (re.compile(r"\bwm\s*supercenter\b|\bwal[\s-]*mart\b|\bsupercenter\b", re.I), "Walmart Supercenter"),
    (re.compile(r"\bu[\s-]?haul\b", re.I), "U-Haul"),
    (re.compile(r"\bpublic storage\b", re.I), "Public Storage"),
    (re.compile(r"\btarget\b", re.I), "Target"),
    (re.compile(r"\bcostco\b", re.I), "Costco"),
    (re.compile(r"\bkroger\b", re.I), "Kroger"),
    (re.compile(r"\bh[\s-]?e[\s-]?b\b", re.I), "H-E-B"),
]

_SKIP = re.compile(
    r"thank|phone|placed at|pickup|doordash|receipt|welcome|total\s+\d|"
    r"your payment|successful|previous balance|new balance|"
    r"^(tel|www|http|store\s*#|#\d|qty|tax|cash|change|st#|op#)",
    re.I,
)


def _header_candidates(lines: list[str]) -> list[str]:
    candidates: list[str] = []
    for line in lines[:15]:
        trimmed = line.strip(" -=|_")
        if len(trimmed) < 6 or len(trimmed) > 50:
            continue
        letters = re.findall(r"[A-Za-z]", trimmed)
        if len(letters) < 5 or _SKIP.search(trimmed):
            continue
        if re.search(r"\d{5,}", trimmed) and not re.search(r"[A-Za-z]{3,}", trimmed):
            continue
        if len(letters) / max(len(trimmed), 1) < 0.5:
            continue
        if trimmed not in candidates:
            candidates.append(trimmed)
    return candidates


def extract_merchant_candidates(lines: list[str], full_text: str = "") -> list[str]:
    blob = full_text or "\n".join(lines)
    candidates: list[str] = []
    for pattern, name in KNOWN_MERCHANTS:
        if pattern.search(blob) and name not in candidates:
            candidates.append(name)
    for name in _header_candidates(lines):
        if name not in candidates:
            candidates.append(name)
    return candidates[:6]


def extract_merchant(lines: list[str], full_text: str = "") -> str:
    candidates = extract_merchant_candidates(lines, full_text)
    return candidates[0] if candidates else "Unknown Merchant"
