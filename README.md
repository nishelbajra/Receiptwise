# ReceiptWise

Local receipt tracking for a student MVP: photograph a receipt, confirm the draft, then ask questions about confirmed spending.

## Architecture

```
Browser
  |
  v
Next.js web app
  |
  v
Next.js API
  |
  +--> PostgreSQL          confirmed transactions, budgets, categories
  +--> Private file storage original receipt images
  +--> Python OCR service  image cleanup -> Tesseract -> raw text
  +--> Receipt parser      regex/rules -> date, total, tax, merchant candidates
  +--> Local Ollama        Qwen3 4B -> merchant, category, questions, assistant
```

| Task | Tool |
| --- | --- |
| Read printed receipt text | Tesseract |
| Find total, tax, date | Rules/regex |
| Clean merchant name | Qwen3 4B |
| Choose a category | Qwen3 4B + fixed category list |
| Ask about unclear values | Qwen3 4B |
| Save financial data | User confirmation only |
| Answer spending questions | Qwen3 4B + read-only database tools |

Qwen does not extract dollar amounts. The assistant can only call:

- `get_spending_summary(month)`
- `get_spending_by_category(month)`
- `get_transactions(filters)`
- `compare_months(month_a, month_b)`
- `get_budget_status()`

## Stack

- Next.js + TypeScript + Tailwind
- PostgreSQL + Prisma
- Auth.js / NextAuth (email/password; Google optional)
- Python + FastAPI + Tesseract
- Ollama + Qwen3 4B (4-bit)
- Local disk storage (`storage/receipts`)

Not used: Docling, Gemini, GPT-4o, Plaid, Redis/BullMQ.

## Required to run

These must be installed and running on this machine:

1. **Node.js 20+**
2. **PostgreSQL** with `DATABASE_URL` in `.env`
3. **Tesseract** (`brew install tesseract`)
4. **Python 3.11+** and the OCR virtualenv
5. **Ollama** with the 4-bit Qwen3 4B model:

```bash
brew install ollama
ollama serve
ollama pull qwen3:4b
```

6. `.env` values:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL=http://localhost:3000`
   - `OCR_SERVICE_URL=http://localhost:8000`
   - `OLLAMA_HOST=http://localhost:11434`
   - `OLLAMA_MODEL=qwen3:4b`

Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

A remote public app cannot stay free and always online unless this laptop is the server. That is expected for the student demo.

## Setup

```bash
cp .env.example .env
npm install
npx prisma db push
npx prisma generate

cd ocr-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run

Terminal 1 — OCR:

```bash
npm run ocr:start
```

Terminal 2 — Ollama, if it is not already running:

```bash
ollama serve
```

Terminal 3 — app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Check local services at [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Later, only if needed

- Private S3-compatible storage
- Redis/BullMQ if upload volume grows
- Docling if you need strong PDF/invoice/table handling
- A VPS if you want the app online when the laptop is off
