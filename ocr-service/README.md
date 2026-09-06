# Tesseract OCR Service

Image cleanup → Tesseract → raw text → regex/rules parser.

Qwen does **not** run here. Numbers stay deterministic.

```
ocr-service/
├── api/routes.py
├── ocr/tesseract.py
├── ocr/preprocessing.py
├── parser/
└── validation/receipt_validator.py
```

## Run locally

```bash
brew install tesseract
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

## Endpoints

- `GET /health`
- `POST /ocr` / `POST /ocr/base64` — raw Tesseract text
- `POST /extract-receipt` / `POST /extract-receipt/base64` — parsed date, totals, merchant candidates
