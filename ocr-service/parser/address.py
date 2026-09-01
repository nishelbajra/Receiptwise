from __future__ import annotations

import re


def _clean(line: str) -> str:
    line = re.sub(r"^\s*address:\s*", "", line, flags=re.I)
    line = re.sub(r"\s+", " ", line).strip(" ,")
    return line


def extract_address(text: str) -> str | None:
    candidates = []
    for raw in text.splitlines():
        line = _clean(raw)
        if not line or len(line) > 90 or re.search(r"greek row|email|phone|5g|leasingpayment", line, re.I):
            continue
        if re.search(
            r"\d{1,6}\s+.+\b(st|street|ave|avenue|rd|road|blvd|dr|drive|ln|way|pkwy|parkway|ste|mill)\b",
            line,
            re.I,
        ):
            candidates.append(line)
        elif re.search(r"[A-Za-z].+,\s*[A-Z]{2}\s+\d{5}", line):
            candidates.append(line)

    if not candidates:
        return None

    preferred = [c for c in candidates if re.search(r"pioneer|parkway|randol|division", c, re.I)]
    chosen = preferred[0] if preferred else candidates[-1]
    # Drop duplicated halves
    parts = [p.strip() for p in chosen.split(",") if p.strip()]
    deduped = []
    for part in parts:
        if part not in deduped:
            deduped.append(part)
    return ", ".join(deduped)
