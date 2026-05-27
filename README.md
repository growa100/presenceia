# Présence IA — presenceia.com

AI Visibility Checker for Swiss SMEs. Powered by ChatGPT, Claude & Perplexity.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

## Database Setup

Run the SQL in `scripts/init-db.sql` in your Supabase SQL editor:
https://supabase.com/dashboard/project/nsfbosmbyfpszwpqmcyo/sql/new

## Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard.

## Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Supabase (PostgreSQL)
- OpenAI GPT-4o
- Anthropic Claude
- Vercel (hosting)
