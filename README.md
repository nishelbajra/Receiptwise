# ReceiptWise

AI-Powered Personal Financial Intelligence Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

## Overview

ReceiptWise is a modern personal finance application that uses AI to automatically extract and categorize transactions from receipt photos. Track your spending, understand your financial patterns, and get intelligent insights - all from simply snapping a photo of your receipts.

## Features

### Current (Phase 1)
- ✅ User authentication (email + Google OAuth)
- ✅ Modern dashboard with spending overview
- ✅ Receipt upload interface
- ✅ Transaction management
- ✅ Financial account management
- ✅ AI assistant interface
- ✅ Settings and notifications

### Coming Soon
- 📷 AI-powered receipt scanning (GPT-4o Vision)
- 📊 Advanced spending analytics
- 💳 Credit card reward optimization
- 🔔 Proactive financial alerts
- 🏦 Bank account integration (Plaid)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **AI**: OpenAI GPT-4o (Phase 2+)

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nishelbajra/expense_tracker.git
cd expense_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

## Development Roadmap

- **Phase 1**: Foundation (Auth, Dashboard, UI) ✅
- **Phase 2**: Receipt Processing (AI extraction, transaction creation)
- **Phase 3**: Analytics (Charts, insights, budgets)
- **Phase 4**: AI Assistant (Conversational financial queries)
- **Phase 5**: Notifications (Alerts, insights, emails)
- **Phase 6**: Payment Methods (Card matching, benefits)

## Contributing

This is a personal portfolio project. Feel free to fork and adapt for your own use.

## License

MIT

---


