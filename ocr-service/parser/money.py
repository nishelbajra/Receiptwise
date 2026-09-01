from __future__ import annotations

import re


def _parse_amount(raw: str) -> float | None:
    cleaned = re.sub(r"[^\d.]", "", raw.replace("..", ".").replace(",", "."))
    if cleaned.count(".") > 1:
        parts = cleaned.split(".")
        cleaned = "".join(parts[:-1]) + "." + parts[-1]
    try:
        value = float(cleaned)
    except ValueError:
        return None
    return value if 0 <= value <= 100000 else None


def _fix_leading_digit(amount: float, line: str) -> float:
    lower = line.lower()
    if not any(token in lower for token in ("discount", "guptotal", "subtotal", "total")):
        return amount
    if 100 <= amount < 1000:
        alt = float(f"{amount:.2f}"[1:])
        if 1 <= alt <= 99.99:
            return alt
    return amount


def _amounts_on_line(line: str) -> list[float]:
    found = []
    for match in re.finditer(r"\$\s*([\d]+(?:\.\.|\.|,)\d{2})\b", line):
        amount = _parse_amount(match.group(1))
        if amount is not None:
            found.append(_fix_leading_digit(amount, line))
    if not found:
        for match in re.finditer(r"\b([\d]+(?:\.\.|\.|,)\d{2})\b", line):
            amount = _parse_amount(match.group(1))
            if amount is not None:
                found.append(_fix_leading_digit(amount, line))
    if found:
        return found
    if re.search(r"(subtotal|total|tax|amount|payment|balance)", line, re.I):
        digits = re.search(r"(\d{4,5})\b", line.replace(" ", ""))
        if digits and "." not in line:
            raw = digits.group(1)
            found.append(int(raw[:-2]) + int(raw[-2:]) / 100)
    return found


def _amount_near_label(lines: list[str], index: int) -> float | None:
    amounts = _amounts_on_line(lines[index])
    if amounts:
        return amounts[-1]
    if index + 1 < len(lines):
        next_amounts = _amounts_on_line(lines[index + 1])
        if next_amounts:
            return next_amounts[0]
    return None


def extract_money(text: str) -> dict:
    """Extract paid amount, balances, tax, tip, and subtotal."""
    subtotal = tax = tip = total = previous_balance = balance_due = None
    locked_total = False
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    payment_of = re.search(r"payment of\s+\$?\s*([\d,]+\.\d{2})", text, re.I)
    if payment_of:
        total = _parse_amount(payment_of.group(1))
        locked_total = True

    for index, line in enumerate(lines):
        lower = line.lower().replace("tscover", "discover")
        if re.search(r"total\s+\d+\s+items", lower):
            continue

        amount = _amount_near_label(lines, index)
        if amount is None:
            continue

        amounts = _amounts_on_line(line)
        if re.search(r"\btotal\b", lower) and len(amounts) >= 2:
            amount = amounts[0]
        if re.search(r"\btax\b", lower) and len(amounts) >= 2:
            amount = next((value for value in amounts if value > 0), amounts[0])

        if re.search(r"previous\s+balance|old\s+balance|starting\s+balance", lower):
            previous_balance = amount
        elif re.search(r"new\s+balance|remaining\s+balance|ending\s+balance", lower):
            balance_due = amount
        elif re.search(
            r"today['\s]*s\s+payment|this\s+payment|payment\s+amount|"
            r"amount\s+paid|you\s+paid|paid\s+today",
            lower,
        ):
            total = amount
            locked_total = True
        elif re.search(r"discounted|guptotal", lower):
            total = amount
            locked_total = True
        elif re.search(r"sub\s*-?\s*total", lower) and "discount" not in lower:
            subtotal = amount
        elif re.search(r"\b(tip|gratuity)\b", lower):
            tip = amount
        elif re.search(r"\b(sales\s*tax|hst|gst|vat|tax\s*\d|\btax\b)", lower) and "taxable" not in lower:
            if amount < 40:
                tax = amount
        elif re.search(r"balance\s+due|amount\s+due|amount\s+owing", lower):
            if locked_total:
                balance_due = amount
            else:
                total = amount
        elif locked_total:
            continue
        elif re.search(r"\b(grand\s*total|payment received)\b", lower):
            total = amount
        elif re.search(r"\btend\b", lower) and amount > 1:
            total = total or amount
        elif re.search(r"\btotal\b", lower) and "sub" not in lower and "item" not in lower:
            total = amount

    if total is None and subtotal is not None:
        total = subtotal
    if total is None and previous_balance is not None and balance_due is not None:
        paid = round(previous_balance - balance_due, 2)
        if paid > 0:
            total = paid

    if total is not None and subtotal is not None and tax is None:
        derived = round(total - subtotal, 2)
        if 0 < derived <= total:
            tax = derived

    return {
        "subtotal": subtotal,
        "taxAmount": tax,
        "tipAmount": tip,
        "totalAmount": total or 0.0,
        "previousBalance": previous_balance,
        "balanceDue": balance_due,
    }
