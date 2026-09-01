# Tesseract OCR Service

Tesseract is the **primary** parser. Gemini only fills fields Tesseract left empty.

```
ocr-service/
├── api/routes.py
├── ocr/tesseract.py
├── ocr/preprocessing.py
├── parser/
│   ├── merchant.py
│   ├── address.py
│   ├── date.py
│   ├── money.py
│   ├── payment.py
│   └── receipt_parser.py
├── extraction/
│   ├── gemini.py
│   └── merger.py
├── validation/receipt_validator.py
└── schemas/receipt.py
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
- `POST /extract-receipt` / `POST /extract-receipt/base64` — structured receipt (primary)

Set `ENABLE_GEMINI=false` to disable the secondary Gemini fill-in.
