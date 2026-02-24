# VitalDocs AI

> **Clinical decision support for US healthcare professionals — powered by RAG and CDC clinical guidelines.**

A Next.js SaaS application built during the SaaS Vibe Coding Bootcamp. VitalDocs AI lets healthcare professionals ask natural-language questions and receive immediate, cited answers grounded exclusively in authoritative CDC public health documents.

---

## What's Been Built

### Landing Page (`/landing_page`)
A polished Next.js 16 + React 19 + Tailwind CSS 4 marketing page with:
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

Currently indexed: **717 clean chunks** across 15 sources.

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
Create `landing_page/.env.local`:
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
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

### 🔴 Bugs / Data Issues
- [ ] **Fix dead Influenza CDC URLs** — 3 sources return 404 (`antiviral-use-influenza.htm`, `clinician_guidance_ridt.htm`, `summary-recommendations.htm`). Find current CDC URLs and update `SOURCES` in `ingest.ts`
- [ ] **Fix dead Flu Weekly View URL** — `cdc.gov/flu/weekly/index.htm` returns 404
- [ ] **Replace placeholder social proof copy** in Hero — "5000+ Appointments / Patients booked already" is a generic template; update to match the clinical SaaS brand (e.g. CDC documents indexed count)

### 🟡 Feature: Chat UI
- [ ] Build the chat interface page at `/chat` (the destination for all hero CTAs)
- [ ] Wire the hero "Get Started" button → `/chat` (primary CTA, currently unwired)
- [ ] Implement streaming message display with a skeleton loader / "thinking" state
- [ ] Add citation pill badges on AI responses (e.g. `[CDC: Measles Pink Book]`) as specified in the design proposal
- [ ] "View Example Queries" CTA — populate with pre-canned demo questions and link to `/chat` with a pre-filled query

### 🟡 Feature: Landing Page Completion
- [ ] Wire up all Navbar links (About, Services, Doctors, Blog — or replace with product-appropriate links)
- [ ] Wire "Watch Video" CTA button (demo video or modal)
- [ ] Replace "Book a call" Navbar CTA with a product-relevant action (e.g. "Try It Free" → `/chat`)
- [ ] Subheadline copy is still a generic placeholder — update to match PROPOSAL copy
- [ ] Add Features / How It Works section below the hero
- [ ] Add trust strip: "Indexing X pages of CDC documentation" (from PROPOSAL)

### 🟢 Infrastructure / Polish
- [ ] Add Mumps and Rubella vaccination guidance CDC pages to the corpus
- [ ] Add CDC Influenza overview pages once URLs are resolved
- [ ] Consider adding WHO sources to expand the knowledge base
- [ ] Set up CI to re-run ingestion when source list changes
- [ ] Add error monitoring (Sentry or similar)
- [ ] Deploy to Vercel
<END_OF_CONTENT>}}]