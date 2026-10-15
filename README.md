# ReceiptWise

**AI-Powered Personal Finance Tracker**

**Live Demo:** [https://receiptwise-sand.vercel.app](https://receiptwise-sand.vercel.app)

ReceiptWise automatically extracts financial data from receipt photos using AI, helping you track spending, categorize transactions, and manage your finances effortlessly.

![Landing Page](docs/screenshots/landing.png)

## Features

- **Smart Receipt Scanning** - Upload receipt photos and let AI extract merchant, items, totals, tax, and payment card details
- **Card Recognition** - Automatically detects card type and last 4 digits from receipts
- **Expense Tracking** - View all transactions with detailed breakdowns
- **Auto-Categorization** - Transactions are automatically categorized (Groceries, Restaurants, Transportation, etc.)
- **AI Assistant** - Chat with an AI assistant to get insights about your spending (available for local development, cloud support coming soon)
- **Secure Authentication** - Email/password and Google OAuth sign-in
- **Responsive Design** - Works on desktop and mobile

## How It Works

1. **Add Your Cards First** - Go to the Accounts page and add your payment cards (Visa, Mastercard, etc.) with the last 4 digits
2. **Upload Receipts** - Take a photo of your receipt and upload it
3. **Automatic Matching** - The AI extracts the card details from the receipt and matches it to your saved cards
4. **Track Spending by Card** - See which card was used for each transaction, helping you track spending across different accounts

This workflow allows you to see exactly where each card is being used and monitor spending patterns per card.

## Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Receipt Scanning
![Receipt Scan](docs/screenshots/receipt-scan.jpg)

### Transactions
![Transactions](docs/screenshots/transactions.png)

### Login
![Login](docs/screenshots/login.png)

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Email + Google OAuth)
- **AI/OCR**: Google Gemini 2.5 Flash (cloud) / Tesseract + Ollama (local development)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Gemini API key (for cloud) OR Ollama with Qwen3 model (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nishelbajra/Receiptwise.git
   cd Receiptwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/receiptwise"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # For Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # For AI Receipt Scanning (choose one)
   # Option 1: Gemini API (recommended for deployment)
   GEMINI_API_KEY="your-gemini-api-key"
   
   # Option 2: Local Ollama
   OLLAMA_HOST="http://localhost:11434"
   OLLAMA_MODEL="qwen3:4b"
   OCR_SERVICE_URL="http://localhost:8000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Running with Local AI (Optional)

If you prefer local AI processing instead of Gemini:

```bash
# Terminal 1: Start OCR service
cd ocr-service
source venv/bin/activate
uvicorn main:app --port 8000

# Terminal 2: Start Ollama
ollama serve
ollama pull qwen3:4b

# Terminal 3: Start the app
npm run dev
```

## Project Structure

```
receiptwise/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   └── lib/                # Utilities and configurations
├── prisma/                 # Database schema
├── ocr-service/           # Python OCR service (for local AI)
└── docs/                  # Documentation and screenshots
```

## API Keys

### Gemini API (Recommended for Deployment)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Add to `.env` as `GEMINI_API_KEY`

Gemini 2.5 Flash is fast, accurate, and the free tier includes 1,500 requests per day.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Set up a PostgreSQL database (recommend [Neon](https://neon.tech) - free tier)
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your Neon connection string
   - `NEXTAUTH_SECRET` - A random secret string
   - `GEMINI_API_KEY` - Your Gemini API key
5. Deploy

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

**Nishel Bajracharya**

- GitHub: [@nishelbajra](https://github.com/nishelbajra)
