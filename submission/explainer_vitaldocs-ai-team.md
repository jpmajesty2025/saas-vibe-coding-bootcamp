# VitalDocs AI — Submission Form

**Date:** 2026-02-24

---

## Product

**Product Name:** VitalDocs AI

**One-line Description:** AI-powered clinical decision support that delivers instant, cited answers from CDC guidelines for US healthcare professionals.

---

## Team

| Name | Email |
|------|-------|
| David Schonberger | jpmajesty2019@gmail.com |

**Team Name:** vitaldocs-ai-team

---

## Links

**Live Deployment URL:** https://vitaldocs-ai.vercel.app

**GitHub Repository URL:** https://github.com/jpmajesty2025/saas-vibe-coding-bootcamp

---

## Problem Statement

Healthcare professionals waste valuable time manually searching through dense CDC clinical guidelines to answer time-sensitive questions about infectious disease management, vaccination protocols, and infection control. VitalDocs AI solves this by indexing 1,155+ chunks from 27 current CDC source documents and surfacing accurate, streamed answers with inline source citations — so clinicians get trusted answers in seconds, not minutes. Every response cites the exact CDC guideline it draws from, making VitalDocs AI a transparent, auditable clinical decision support tool rather than a generic AI chatbot.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **AI:** OpenAI GPT-4o-mini + text-embedding-3-small via AI SDK v6
- **Vector DB:** Neon Postgres + pgvector (1,155 CDC guideline chunks)
- **Auth:** Clerk (Google OAuth + email, custom sign-in pages)
- **Deployment:** Vercel

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, stats, and pricing |
| `/sign-in` | Clerk-powered sign-in (custom domain) |
| `/sign-up` | Clerk-powered sign-up |
| `/chat` | Protected RAG chat UI with citation badges |
| `/dashboard` | Protected user dashboard (usage, coverage, history) |
| `/api/chat` | Streaming RAG API (Next.js Route Handler) |
| `/api/sources` | Citation source lookup API |
