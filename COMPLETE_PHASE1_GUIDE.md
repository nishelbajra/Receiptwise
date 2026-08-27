# ReceiptWise Phase 1 - Complete Setup Guide

This guide walks you through setting up ReceiptWise Phase 1 from scratch, including all prerequisites, dependencies, and GitHub configuration.

---

## Table of Contents

1. [Prerequisites Installation](#1-prerequisites-installation)
2. [Initialize Next.js Project](#2-initialize-nextjs-project)
3. [Install Dependencies](#3-install-dependencies)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Setup](#5-database-setup)
6. [Verify All Files](#6-verify-all-files)
7. [Run the Application](#7-run-the-application)
8. [GitHub Authentication & Push](#8-github-authentication--push)
9. [Verification Checklist](#9-verification-checklist)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites Installation

### 1.1 Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the instructions to add Homebrew to your PATH:

```bash
echo >> ~/.zshrc
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 1.2 Install Node.js (v18 or later)

```bash
brew install node
```

Verify installation:

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
npx --version    # Should show 9.x.x or higher
```

### 1.3 Install PostgreSQL

**Option A: Using Homebrew (Recommended for development)**

```bash
brew install postgresql@16
brew services start postgresql@16
```

Add to PATH:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify:

```bash
psql --version
```

**Option B: Using Postgres.app (GUI-based)**

1. Download from https://postgresapp.com/
2. Move to Applications folder
3. Open and click "Initialize"
4. Add CLI tools to PATH as instructed

**Option C: Using Docker**

```bash
docker run --name receiptwise-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=receiptwise -p 5432:5432 -d postgres:16
```

### 1.4 Install GitHub CLI (for authentication)

```bash
brew install gh
```

---

## 2. Initialize Next.js Project

Navigate to your project directory:

```bash
cd ~/Projects/expense_tracker
```

Initialize Next.js (this creates package.json and base config files):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted:
- **Would you like to use Turbopack?** → No
- If it asks to overwrite existing files, select **No** for files we've already created (like `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`)

> **Note:** If create-next-app complains about existing files, you may need to temporarily move them, run the init, then move them back. See troubleshooting section.

---

## 3. Install Dependencies

### 3.1 Core Dependencies

```bash
npm install @prisma/client @auth/prisma-adapter next-auth@beta bcryptjs zod @tanstack/react-query clsx tailwind-merge lucide-react
```

### 3.2 Dev Dependencies

```bash
npm install -D prisma @types/bcryptjs
```

### 3.3 Install shadcn/ui

Initialize shadcn:

```bash
npx shadcn@latest init
```

When prompted:
- **Which style would you like to use?** → Default
- **Which color would you like to use as base color?** → Slate
- **Would you like to use CSS variables for colors?** → Yes

Install required components:

```bash
npx shadcn@latest add button card input label dropdown-menu avatar separator
```

---

## 4. Environment Configuration

### 4.1 Create .env file

```bash
cp .env.example .env
```

### 4.2 Edit .env with your values

Open `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/receiptwise?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production-min-32-chars"

# Google OAuth (Optional for Phase 1 - can leave empty)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI (Phase 2 - leave empty for now)
OPENAI_API_KEY=""

# AWS S3/R2 (Phase 2 - leave empty for now)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_REGION=""

# Email (Phase 5 - leave empty for now)
RESEND_API_KEY=""

# Plaid (Phase 6 - leave empty for now)
PLAID_CLIENT_ID=""
PLAID_SECRET=""
PLAID_ENV=""
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

Copy the output and paste it as NEXTAUTH_SECRET.

---

## 5. Database Setup

### 5.1 Create the Database

**If using Homebrew PostgreSQL:**

```bash
createdb receiptwise
```

**If using Docker:**

Database was created during container setup.

**If using Postgres.app:**

Open psql and run:

```sql
CREATE DATABASE receiptwise;
```

### 5.2 Initialize Prisma

```bash
npx prisma init
```

> Note: This may overwrite the schema.prisma file. If so, restore from the existing content.

### 5.3 Apply Database Schema

```bash
npx prisma db push
```

This creates all tables defined in `prisma/schema.prisma`.

### 5.4 Generate Prisma Client

```bash
npx prisma generate
```

### 5.5 Verify Database (Optional)

```bash
npx prisma studio
```

This opens a browser-based database viewer at http://localhost:5555.

---

## 6. Verify All Files

Ensure all these files exist with correct content. The files should already be in place from the previous setup.

### File Structure

```
expense_tracker/
├── .env                          # Your environment variables
├── .env.example                  # Template for environment variables
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── package.json                  # Node.js dependencies (created by Next.js)
├── next.config.js                # Next.js configuration (created by Next.js)
├── tailwind.config.ts            # Tailwind configuration (created by Next.js)
├── tsconfig.json                 # TypeScript configuration (created by Next.js)
├── prisma/
│   └── schema.prisma             # Database schema ✓
├── src/
│   ├── app/
│   │   ├── globals.css           # Global styles ✓
│   │   ├── layout.tsx            # Root layout ✓
│   │   ├── page.tsx              # Landing page ✓
│   │   ├── (auth)/
│   │   │   ├── layout.tsx        # Auth layout ✓
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Login page ✓
│   │   │   └── register/
│   │   │       └── page.tsx      # Register page ✓
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Dashboard layout ✓
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      # Main dashboard ✓
│   │   │   ├── receipts/
│   │   │   │   ├── page.tsx      # Receipts list ✓
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx  # Receipt upload ✓
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx      # Transactions ✓
│   │   │   ├── accounts/
│   │   │   │   └── page.tsx      # Accounts ✓
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx      # Analytics ✓
│   │   │   ├── assistant/
│   │   │   │   └── page.tsx      # AI Assistant ✓
│   │   │   └── settings/
│   │   │       └── page.tsx      # Settings ✓
│   │   └── api/
│   │       └── auth/
│   │           ├── [...nextauth]/
│   │           │   └── route.ts  # NextAuth handler ✓
│   │           └── register/
│   │               └── route.ts  # Registration API ✓
│   ├── components/
│   │   ├── providers.tsx         # React providers ✓
│   │   ├── ui/                   # shadcn/ui components (auto-generated)
│   │   └── layout/
│   │       ├── sidebar.tsx       # Sidebar navigation ✓
│   │       ├── header.tsx        # Page header ✓
│   │       └── user-nav.tsx      # User dropdown ✓
│   ├── lib/
│   │   ├── auth.ts               # NextAuth configuration ✓
│   │   ├── db.ts                 # Prisma client ✓
│   │   └── utils.ts              # Utility functions ✓
│   └── types/
│       └── next-auth.d.ts        # NextAuth type extensions ✓
```

---

## 7. Run the Application

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Open in Browser

Navigate to: **http://localhost:3000**

You should see:
- Landing page with ReceiptWise branding
- "Get Started" button leading to registration
- "Sign In" link in header

### 7.3 Test Authentication Flow

1. Click "Get Started" or navigate to `/register`
2. Create an account with name, email, password
3. After registration, sign in at `/login`
4. You should be redirected to `/dashboard`
5. Dashboard shows placeholder metrics and navigation

---

## 8. GitHub Authentication & Push

### 8.1 Authenticate with GitHub CLI

```bash
gh auth login
```

Follow the prompts:
- **What account do you want to log into?** → GitHub.com
- **What is your preferred protocol?** → HTTPS
- **Authenticate Git with your GitHub credentials?** → Yes
- **How would you like to authenticate?** → Login with a web browser

This opens your browser. Authorize the GitHub CLI.

Verify authentication:

```bash
gh auth status
```

### 8.2 Commit Remaining Changes

Add the blueprint file and any new files:

```bash
git add RECEIPTWISE_BLUEPRINT.html COMPLETE_PHASE1_GUIDE.md
git add package.json package-lock.json next.config.* tsconfig.json tailwind.config.* postcss.config.*
git add components.json
git add -A  # Add any remaining new files
```

Commit:

```bash
git commit -m "$(cat <<'EOF'
Complete Phase 1 setup with all dependencies and configuration

- Add Node.js project configuration (package.json, tsconfig, etc.)
- Add shadcn/ui component library setup
- Add complete setup documentation
- Add architecture blueprint (HTML format)
EOF
)"
```

### 8.3 Push to GitHub

Push the Phase 1 branch:

```bash
git push -u origin cursor/receiptwise-phase1-foundation
```

### 8.4 Create Pull Request (Optional)

Create a PR to merge Phase 1 into main:

```bash
gh pr create --title "Phase 1: ReceiptWise Foundation" --body "$(cat <<'EOF'
## Summary

Complete rewrite of the expense tracker as ReceiptWise - an AI-powered personal financial assistant.

### What's Included

- **Authentication**: NextAuth.js with email/password and Google OAuth
- **Database**: PostgreSQL with Prisma ORM, complete schema for financial data
- **UI Framework**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Pages**: Landing, Login, Register, Dashboard, Receipts, Transactions, Accounts, Analytics, AI Assistant, Settings
- **Security**: JWT sessions, bcrypt password hashing, input validation

### Test Plan

- [ ] `npm install` completes without errors
- [ ] `npx prisma db push` creates all tables
- [ ] `npm run dev` starts the development server
- [ ] User can register a new account
- [ ] User can log in with created account
- [ ] Dashboard loads after authentication
- [ ] All navigation links work

EOF
)"
```

---

## 9. Verification Checklist

Run through this checklist to confirm Phase 1 is complete:

### Prerequisites
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL running (`psql --version` or Docker container)

### Project Setup
- [ ] `npm install` completed without errors
- [ ] `.env` file created with DATABASE_URL and NEXTAUTH_SECRET
- [ ] `npx prisma db push` completed successfully
- [ ] `npx prisma generate` completed successfully

### Application
- [ ] `npm run dev` starts without errors
- [ ] Landing page loads at http://localhost:3000
- [ ] Registration form works at /register
- [ ] Login form works at /login
- [ ] Dashboard loads after authentication
- [ ] Sidebar navigation works (all links)
- [ ] User can log out

### Git & GitHub
- [ ] All changes committed
- [ ] Branch pushed to GitHub
- [ ] PR created (optional)

---

## 10. Troubleshooting

### "npx: command not found"

Node.js is not installed or not in PATH. Install Node.js:

```bash
brew install node
```

### "create-next-app complains about existing files"

Move existing src files temporarily:

```bash
mv src src_backup
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
rm -rf src
mv src_backup src
```

### "ECONNREFUSED 127.0.0.1:5432"

PostgreSQL is not running. Start it:

```bash
brew services start postgresql@16
# OR for Docker:
docker start receiptwise-db
```

### "relation does not exist" errors

Database schema not applied. Run:

```bash
npx prisma db push
npx prisma generate
```

### "Module not found: Can't resolve '@/components/ui/...'"

shadcn components not installed. Run:

```bash
npx shadcn@latest add button card input label dropdown-menu avatar separator
```

### "NEXTAUTH_SECRET" errors

Generate and add a secret to .env:

```bash
openssl rand -base64 32
```

### GitHub push rejected (authentication)

Authenticate with GitHub CLI:

```bash
gh auth login
```

### "Objects cannot be passed to client components"

This is a React Server Components issue. Ensure components using hooks (useState, useEffect) have `"use client"` directive at the top.

---

## Next Steps

After completing Phase 1, you have:

1. **Working authentication** - Users can register and log in
2. **Database schema** - Ready for all financial data
3. **Dashboard shell** - Navigation and layout complete
4. **Placeholder pages** - All routes set up

**Phase 2** will add:
- Receipt upload functionality
- AI-powered receipt extraction (OCR + GPT-4o Vision)
- Transaction creation from receipts
- Receipt storage in cloud (S3/R2)

---

## Quick Command Reference

```bash
# Start development server
npm run dev

# Open Prisma Studio (database viewer)
npx prisma studio

# Apply schema changes
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# Create a migration (for production)
npx prisma migrate dev --name description

# Run linter
npm run lint

# Build for production
npm run build
```
