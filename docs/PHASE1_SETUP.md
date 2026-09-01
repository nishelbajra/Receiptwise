# ReceiptWise - Phase 1 Setup Guide

## Overview
Phase 1 establishes the foundation: project setup, authentication, database, and basic dashboard shell.

**Deliverable:** User can sign up, log in (email + Google), and see an empty dashboard with navigation.

---

## Prerequisites

### 1. Install Node.js (Required)

**Option A - Using Homebrew (Recommended):**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (follow the instructions shown after install)
# Then install Node.js
brew install node
```

**Option B - Direct Download:**
1. Go to https://nodejs.org
2. Download the LTS version
3. Run the installer
4. Restart your terminal

**Verify installation:**
```bash
node --version   # Should show v20.x or higher
npm --version    # Should show 10.x or higher
```

### 2. Install PostgreSQL

**Option A - Using Homebrew:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Option B - Postgres.app (Easiest):**
1. Download from https://postgresapp.com
2. Move to Applications and open
3. Click "Initialize" to create a server

**Option C - Use Neon (Cloud - No Install):**
1. Go to https://neon.tech
2. Sign up and create a free database
3. Copy the connection string

---

## Step-by-Step Setup

### Step 1: Initialize Next.js Project

```bash
cd ~/Projects/expense_tracker

# Initialize Next.js with TypeScript, Tailwind, App Router
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted:
- Would you like to use Turbopack? → **No**

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @prisma/client next-auth@beta @auth/prisma-adapter
npm install zod bcryptjs
npm install @tanstack/react-query
npm install lucide-react
npm install recharts

# UI components (shadcn/ui)
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Add essential shadcn components
npx shadcn@latest add button card input label form toast avatar dropdown-menu dialog tabs separator badge

# Dev dependencies
npm install -D prisma @types/bcryptjs
```

### Step 3: Initialize Prisma

```bash
npx prisma init
```

### Step 4: Create Database (if using local PostgreSQL)

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE receiptwise;
\q
```

### Step 5: Configure Environment Variables

Edit `.env` file:

```env
# Database
DATABASE_URL="postgresql://YOUR_USERNAME:@localhost:5432/receiptwise?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-string-here-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional for Phase 1, can add later)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 6: Set Up Database Schema

Replace `prisma/schema.prisma` with the content from the generated file (see below).

Then run:
```bash
npx prisma db push
npx prisma generate
```

### Step 7: Copy Project Files

Copy all the files I've generated (listed below) into their respective locations.

### Step 8: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## File Structure After Setup

```
expense_tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── receipts/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── accounts/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── user-nav.tsx
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── types/
│       └── next-auth.d.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
└── package.json
```

---

## Verification Checklist

After setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] Landing page loads at http://localhost:3000
- [ ] Register page works at http://localhost:3000/register
- [ ] Login page works at http://localhost:3000/login
- [ ] Can create a new account
- [ ] Can log in with created account
- [ ] Dashboard shows after login
- [ ] Sidebar navigation works
- [ ] Can log out

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Database connection errors
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Try: `brew services restart postgresql@16`

### Auth errors
- Ensure NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your dev server URL

### shadcn component errors
```bash
npx shadcn@latest add [component-name]
```

---

## Next Steps (Phase 2)

After Phase 1 is complete:
1. Receipt upload component
2. AI receipt extraction (OpenAI GPT-4o)
3. Transaction creation from receipts
4. Basic categorization

Let me know when you've completed Phase 1 and we'll proceed!
