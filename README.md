# VitalDocs AI

> **Clinical decision support for US healthcare professionals — powered by RAG and CDC clinical guidelines.**

A Next.js SaaS application built during the SaaS Vibe Coding Bootcamp. VitalDocs AI lets healthcare professionals ask natural-language questions and receive immediate, cited answers grounded exclusively in authoritative CDC public health documents.

---

## What's Been Built

### App (`landing_page/`)
A polished Next.js 16 + React 19 + Tailwind CSS 4 application with:
- **Navbar** — Animated top bar with the VitalDocs AI brand and navigation links
- **Hero section** — Two-column layout with headline, subheadline, CTA buttons, star-rating badge, social proof strip, and a floating hero image

### RAG Ingestion Pipeline (`scripts/ingest.ts`)
A standalone Node.js/TSX script that:
1. Fetches **15 CDC HTML sources** covering MMR (Measles/Mumps/Rubella), Pertussis, COVID-19, and Immunization Schedules
2. Extracts body text via **cheerio** (nav/footer/scripts stripped)
3. Chunks text into ~800-character windows with 100-character overlap
4. Applies a **text quality filter** — rejects chunks with >5% non-ASCII characters or fewer than 5 words (prevents binary/junk embeddings)
5. Generates embeddings with **OpenAI `text-embedding-3-small`**
6. Stores embeddings in **Postgres + pgvector** (Neon Serverless)

Currently indexed: **1,155+ clean chunks** across 27 sources.

### Chat API (`src/app/api/chat/route.ts`)
A streaming REST endpoint (`POST /api/chat`) that:
- Validates requests with **Zod** (max 20 messages, 2000 chars each)
- Embeds the latest user query and performs cosine similarity search (`> 0.5` threshold, top 5 chunks)
- Passes retrieved context into a strict system prompt — model is forbidden from answering outside the provided CDC context
- Streams responses via **`gpt-4o-mini`** using the AI SDK

### Database Client (`src/lib/db/client.ts`)
- Pg connection pool with SSL, idle timeout, and connection timeout tuning
- Self-loading `.env.local` / `.env` so it works in both Next.js and standalone ingestion scripts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19, Tailwind CSS 4, Framer Motion, Lucide React |
| AI / LLM | OpenAI `gpt-4o-mini` via Vercel AI SDK |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| Vector DB | Postgres + pgvector (Neon Serverless) |
| Validation | Zod |
| Ingestion | Node.js + TSX + Cheerio |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Neon (or any Postgres) database with the `pgvector` extension
- OpenAI API key

### Environment Variables
Create `landing_page/.env.local` (the app root — all commands run from this directory):
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Install & Run
```bash
cd landing_page
npm install

# Run the dev server
npm run dev

# (Re-)ingest CDC documents into the vector DB
npm run ingest

# Smoke-test the RAG pipeline
npm run test:rag
```

---

## RAG Corpus

CDC sources currently ingested:

| Topic | Sources |
|---|---|
| Measles | Pink Book Ch.13, Clinical Overview, Infection Control, Vaccination Guidance, Cases & Outbreaks 2025 |
| Mumps | Pink Book Ch.15, Clinical Overview |
| Rubella | Pink Book Ch.20, Clinical Overview |
| Pertussis | Pink Book Ch.16, Clinical Overview, Vaccination Guidance |
| COVID-19 | Clinical Care Overview, Infection Prevention |
| Immunization Schedules | Adult Immunization Schedule 2025 |

---

## TODO

### ✅ Completed
- [x] Fix dead Influenza CDC URLs — replaced 4 dead sources with 10 live HCP-facing CDC pages; corpus now at **1,155 chunks across 27 sources**
- [x] Hero copy updated — real stats and VitalDocs-specific messaging (no more generic placeholders)
- [x] Build chat interface at `/chat` with streaming display, thinking dots, and pre-canned example queries
- [x] Wire hero "Get Started" → `/chat`
- [x] Citation badges on AI responses — interactive cards showing source title + snippet
- [x] `/api/sources` endpoint for citation lookups
- [x] Navbar cleanup — removed dead links, real navigation (Chat, Pricing, CDC Guidelines)
- [x] Pricing section — 3-tier (Free / Pro / Enterprise) on landing page
- [x] Clerk authentication — Google OAuth + email, custom `/sign-in` and `/sign-up` pages
- [x] Middleware protecting `/chat` and `/dashboard`
- [x] Server-side `auth()` guards on `/api/chat` and `/api/sources`
- [x] `/dashboard` page — usage stats, query history, knowledge base coverage
- [x] `/demo` public route — full RAG chat with no sign-in required (for judges/evaluators)
- [x] `/api/demo-chat` and `/api/demo-sources` — unauthenticated API routes for demo
- [x] `/api/health` endpoint — returns `{ status, db, chunkCount, timestamp }` for live verification
- [x] Deploy to Vercel — **live at https://vitaldocs-ai.vercel.app/**

### 🟡 Near-term Polish
- [ ] **Auto-submit example queries** — clicking a suggested question currently populates the input; should auto-submit
- [ ] **Mobile hamburger menu** — Navbar collapses on small screens but has no mobile drawer yet
- [ ] **Chat error states** — surface user-friendly error messages when the API fails or times out
- [ ] **"Watch Demo" CTA** — wire the secondary hero button to the Loom screencast or an in-page modal
- [ ] **Features / How It Works section** — add below the hero to improve landing page conversion

### 🟢 Knowledge Base Expansion
- [ ] Add Mumps and Rubella vaccination guidance CDC pages to the corpus
- [ ] Add WHO sources to supplement CDC guidelines
- [ ] Set up CI / scheduled job to re-run ingestion when CDC source URLs change

### 🔵 Infrastructure
- [ ] Add error monitoring (Sentry or similar)
- [x] IP-based rate limiting on `/api/demo-chat` — 10 req/min per IP, 429 on breach
- [ ] Usage metering — enforce Free tier query limits against the database
<END_OF_CONTENT>}}]