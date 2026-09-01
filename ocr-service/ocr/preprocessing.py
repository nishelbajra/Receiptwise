from __future__ import annotations

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

MAX_SIDE = 2200


def crop_to_receipt(image: Image.Image) -> Image.Image:
    """Keep the bright thermal-receipt region and drop dark background."""
    gray = ImageOps.exif_transpose(image).convert("L")
    arr = np.array(gray)
    mask = arr > 140
    if mask.mean() < 0.02:
        return image

    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    if len(rows) < 20 or len(cols) < 20:
        return image

    top, bottom = int(rows[0]), int(rows[-1])
    left, right = int(cols[0]), int(cols[-1])
    pad_y = max(20, int((bottom - top) * 0.08))
    pad_x = max(12, int((right - left) * 0.04))
    top = max(0, top - pad_y * 2)
    left = max(0, left - pad_x)
    bottom = min(arr.shape[0], bottom + pad_y)
    right = min(arr.shape[1], right + pad_x)

    cropped = image.crop((left, top, right, bottom))
    # Ignore crop if it barely changed anything
    if cropped.size[0] * cropped.size[1] < image.size[0] * image.size[1] * 0.15:
        return image
    return cropped


def preprocess_image(image: Image.Image) -> Image.Image:
    """Normalize receipt photos for Tesseract."""
    image = ImageOps.exif_transpose(image)
    image = crop_to_receipt(image)

    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    width, height = image.size
    longest = max(width, height)
    if longest > MAX_SIDE:
        scale = MAX_SIDE / longest
        image = image.resize(
            (int(width * scale), int(height * scale)),
            Image.Resampling.LANCZOS,
        )
    elif longest < 1200:
        scale = 1200 / longest
        image = image.resize(
            (int(width * scale), int(height * scale)),
            Image.Resampling.LANCZOS,
        )

    gray = image.convert("L")
    gray = ImageOps.autocontrast(gray)
    gray = ImageEnhance.Contrast(gray).enhance(1.8)
    gray = gray.filter(ImageFilter.SHARPEN)
    return gray
