# VitalDocs AI — Phase 2 Roadmap & Strategic Vision

**Date:** 2026-02-25  
**Author:** David Schonberger  
**Status:** Living document — updated as priorities shift  

---

## TL;DR

VitalDocs AI launched as a CDC-grounded RAG chat tool for US healthcare professionals. Phase 2 is about three things: (1) hardening the core product quality, (2) building the data infrastructure that makes the corpus a defensible asset, and (3) exploring the larger market VitalDocs could serve. The long-term moat is not the LLM or the chat UI — it is a **continuously maintained, versioned, semantically searchable corpus of authoritative clinical guidance** backed by strong data pipelines.

---

## Part 1 — Phase 2 TODO List

### 🔴 Priority 1 — Core Quality & Trust

| Item | Description | Effort |
|------|-------------|--------|
| **Durable rate limiting** | Replace in-memory per-instance limiter on `/api/demo-chat` with Upstash Redis or a Postgres `rate_limit` table (IP + rolling window). In-memory resets across serverless cold starts. Consider hCaptcha for abuse mitigation if traffic spikes. | Medium |
| **Lock citations to retrieved chunks** | `/api/sources` currently re-embeds the query independently — in edge cases it returns a different top-5 than what the model saw. Solution: include chunk IDs and source metadata in the streamed response so the client maps badges directly to the exact retrieval set, making citations deterministic. | Hard |
| **Multi-turn retrieval context** | RAG currently embeds only the latest user message. Build a compact retrieval query from the last N turns (or a running LLM-generated summary) so multi-turn sessions preserve clinical context. | Medium |
| **Similarity threshold as env var** | Expose `RETRIEVAL_THRESHOLD` (default `0.5`) in `.env.local` so it can be tuned for A/B evaluation without code changes. | Quick |
| **Evidence panel with CDC anchor links** | Expand citation badge cards to include a direct link to the exact CDC section/header, not just the document URL. Requires structured metadata enrichment during ingestion. | Medium |

---

### 🟡 Priority 2 — Observability & Resilience

| Item | Description | Effort |
|------|-------------|--------|
| **Sentry + structured logging** | Instrument `/api/chat` and `/api/demo-chat` with Sentry for error capture. Add structured logs per request: embed latency (ms), vector query latency (ms), generation latency (ms), similarity scores[], hit@k, `had_context` boolean. | Medium |
| **Retry + error ID in chat UI** | When the chat API fails or times out, show a styled error card with a "Try again" button and a short error ID (for support tracing). Currently shows nothing actionable. | Quick |
| **Corpus refresh automation** | Nightly job: crawl CDC sitemap, hash-compare page content against stored `content_hash`, re-ingest only changed pages. Prevents corpus staleness without full re-ingestion overhead. | Medium |
| **pgvector index validation** | Confirm HNSW index is active and query plan uses it (`EXPLAIN ANALYZE`). Add `VACUUM ANALYZE documents` to post-ingest script to keep planner statistics fresh. | Quick |

---

### 🟢 Priority 3 — Evaluation & Testing

| Item | Description | Effort |
|------|-------------|--------|
| **Offline eval harness** | Build a suite of 15–30 hand-curated CDC Q&A pairs. For each: embed query → retrieve → assert correct source titles in top-5. Track hit rate, grounding rate, and refusal accuracy. Run on every ingest. | Hard |
| **Adversarial / prompt-injection tests** | Test set of queries designed to bypass the "CDC-only" constraint: general knowledge questions, role-playing prompts, out-of-corpus medical topics. Assert that the refusal behavior holds in all cases. | Medium |
| **Playwright E2E smoke tests** | Automated browser tests covering: demo query → streamed answer, citation badge click → source card visible, `/api/health` returns 200 with `chunkCount > 0`. | Medium |

---

### 🔵 Priority 4 — Architecture & Polish

| Item | Description | Effort |
|------|-------------|--------|
| **Routes manifest in README** | Add a rendered app-directory tree or a table listing every route, its auth requirement, and what API it calls. Grader-requested; also useful for onboarding. | Quick |
| **Next.js route groups** | Reorganize `src/app/` into `(marketing)/`, `(app)/`, `(api)/` groups for readability at scale. No behavior change, pure file organization. | Medium |
| **Similarity threshold env var** | Already listed above — doubles as an architecture improvement. | Quick |

---

## Part 2 — Strategic Vision

### What VitalDocs Is Today

A **single-tenant RAG chat interface** over a curated CDC guideline corpus:
- 1,155+ chunks across 27 CDC source documents
- 4 disease areas: MMR, Pertussis, Influenza, COVID-19
- Streamed answers with inline citation badges
- Clerk auth protecting the full app; unauthenticated `/demo` for evaluation
- Deployed on Vercel + Neon (serverless Postgres + pgvector)

The product answers one question well: _"What does CDC say I should do right now?"_

---

### Market Evolution

```
Today                   Near-term                       Long-term
────────────────────    ────────────────────────────    ──────────────────────────────────
CDC corpus only    →    Multi-corpus (WHO, NIH,     →   Real-time clinical intelligence
4 disease areas         IDSA, ACC/AHA, FDA labels)       platform connected to live data
Individual HCP Q&A      Specialty-specific verticals     B2B API / data product / infra
SaaS subscription       Health system pilots             Embedded in EHR workflows
```

---

### Business Problems — Now vs. Extended

| Problem | Who Pays | VitalDocs Angle | Horizon |
|---------|----------|-----------------|---------|
| Clinicians waste time on guideline lookups | Individual HCPs / health systems | ✅ Core product today | Now |
| Can't audit whether care follows current guidelines | CMOs, compliance officers | Clinical decision analytics layer | 6–12 months |
| Staff aren't current on guideline changes | Education / credentialing depts | "Guideline change alerts" & digest product | 6–12 months |
| EHR vendors need CDS hooks grounded in authoritative sources | Epic, Cerner, Athena partners | RAG-as-a-service CDS Hook API | 12–24 months |
| Public health agencies need outbreak response decision support | State/local health depts | Surveillance-aware RAG (live CDC data feeds) | 12–24 months |
| Patients get conflicting info from unvetted sources | Consumer health / health plans | Simplified plain-language variant | 18–36 months |
| Clinical researchers need machine-readable eligibility criteria | Pharma / CROs | Guideline → OMOP phenotype extraction | 18–36 months |

---

### Data Engineering & Analytics Engineering Angles

Given a strong DE/AE background, these represent the highest-leverage, most defensible extensions:

#### 1. CDC Surveillance Data Pipeline
CDC publishes structured surveillance data publicly: FluView (weekly influenza), NNDSS (notifiable diseases), NHSN (healthcare-associated infections), COVID Data Tracker. Ingest these alongside the guidelines corpus and surface them in answers:

> _"Oseltamivir is recommended for high-risk patients [Source 3: CDC Antiviral Use Guidelines] — FluView shows H3N2 predominance in your region this week at 14% ILI rate, above the national baseline."_

**Tech:** Python ingestion jobs → Postgres `surveillance_metrics` table → dbt models → surfaced in RAG system prompt as live context.

#### 2. Corpus Freshness as a Data Product
Every CDC page has a "last reviewed" date. Build a versioned pipeline:
- Nightly crawler computes `content_hash` for every source URL
- Changed pages trigger re-ingestion; old chunks marked `superseded = true`
- `versions` table stores diffs with `ingested_at`, `content_hash`, `changed_fields`
- UI surfaces _"⚠️ This source was updated 3 days ago"_ badges

**Tech:** dbt models on `documents` table: `dim_sources`, `fct_source_versions`. This turns corpus maintenance into an auditable data engineering process rather than a manual script run.

#### 3. Answer Quality Analytics with dbt
Log every query: `(query_text, embedding_vector, similarity_scores[], sources_cited[], had_context, response_latency_ms, user_id)`.

Build dbt marts:
- `fct_queries` — one row per query with all RAG metadata
- `dim_sources` — one row per CDC source with citation frequency, avg similarity score
- `rpt_coverage_gaps` — queries that returned `had_context = false`, grouped by topic cluster (k-means on embeddings)
- `rpt_latency` — p50/p95 latency by component (embed / query / generate)

**Output:** Internal dashboard (Metabase, Superset) showing corpus coverage health, citation hotspots, and latency regressions. This becomes the product analytics backbone.

#### 4. EHR / FHIR CDS Hook Integration
The [HL7 CDS Hooks specification](https://cds-hooks.hl7.org/) defines how EHRs call external services when a clinician opens a patient chart. VitalDocs could register as a CDS Hook provider:
- EHR fires `patient-view` hook with FHIR context (active diagnoses, medications, age)
- VitalDocs constructs a retrieval query from the FHIR context
- Returns a CDS Card with a cited recommendation surfaced inline in the EHR workflow

No separate app required. This is the highest-value distribution channel in healthcare IT.

#### 5. Guideline-Driven OMOP Phenotype Generation
Real-world evidence (RWE) studies require cohort definitions grounded in clinical criteria. Pipeline:
- RAG extracts structured inclusion/exclusion criteria from guideline text
- Maps to OMOP CDM concept codes (ICD-10, RxNorm, LOINC)
- Outputs machine-readable cohort definition JSON (OHDSI CIRCE format)

Targets: pharma, CROs, academic medical centers. High value, long sales cycle.

---

### Biggest Swings (No Idea Too Crazy)

#### A. Bloomberg Terminal for Clinical Guidelines
Comprehensive, real-time, multi-jurisdictional health policy intelligence. Every WHO, CDC, NIH, NICE (UK), EMA, Health Canada update — indexed, versioned, queryable, with change diffs and email digest subscriptions. Hospitals and pharma companies pay for similar intelligence today via expensive advisory services. A well-maintained RAG + data pipeline product undercuts them by orders of magnitude.

#### B. AI Guideline Author Assistant
Flip the product: instead of _consuming_ guidelines, help CDC/WHO _write and maintain_ them. When an author updates a section, automatically check for internal consistency with the rest of the document, flag contradictions with related guidelines, and suggest citation additions. **B2G (business-to-government) play** — long sales cycle, large contract value, near-zero competition today.

#### C. Population Health Gap Analysis Platform
Combine guideline knowledge with claims/EHR data:
> _"68% of your Type 2 diabetic patients did NOT receive the CDC-recommended annual influenza vaccination."_

Automated, continuous guideline adherence reporting at the population level. This is a **DE/AE + RAG hybrid product** — think Databricks + guideline intelligence for health system analytics teams. Sell to CMOs and population health departments.

#### D. Clinical Trial Signal Detection
When the RAG system determines that current guidelines are silent on a clinical question ("insufficient evidence"), surface matching open [ClinicalTrials.gov](https://clinicaltrials.gov) studies. VitalDocs becomes not just an answer engine but a **research navigation tool**, connecting the gap between guideline evidence and ongoing clinical research.

#### E. Global Health Equity Variant
WHO guidelines in multiple languages, contextualized for low-resource settings. Radically different business model (grant-funded, NGO partnerships, global health foundations) but potentially enormous impact. The technical architecture is the same; the corpus, language models, and unit economics differ.

---

### Technology Roadmap Implications

| Phase | Core Capability | Key Tech Additions |
|-------|----------------|--------------------|
| **v1 (done)** | CDC RAG chat, streaming, citations, auth | pgvector, AI SDK, Clerk, Neon |
| **v2** | RAG quality + observability + eval | Upstash Redis, Sentry, dbt, eval harness |
| **v3** | Data product + corpus versioning | Scheduled ingestion, dbt marts, Metabase |
| **v4** | Surveillance-aware answers | CDC API pipelines, FHIR context |
| **v5** | Platform / API product | CDS Hooks, multi-corpus, OMOP output |

---

### The Defensible Moat

The moat is not the LLM — any competitor can swap in the same model. It is not the chat UI. It is:

1. **The corpus** — continuously maintained, versioned, high-quality representations of authoritative clinical guidance
2. **The data infrastructure** — pipelines that keep it fresh, detect changes, measure quality
3. **The trust layer** — provenance, auditability, citation enforcement, refusal behavior
4. **Distribution** — embedded in EHR workflows via CDS Hooks (once achieved)

Points 1–3 are engineering and data engineering problems. They compound over time in a way that LLM prompting alone cannot.

---

## Appendix — Current Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| AI / LLM | OpenAI `gpt-4o-mini` via Vercel AI SDK v6 |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| Vector DB | Neon Postgres + pgvector (HNSW index, cosine ops) |
| Auth | Clerk (Google OAuth + email) |
| Deployment | Vercel |
| Ingestion | Node.js + TSX + Cheerio |
| Validation | Zod |

**Current corpus:** 1,155+ chunks · 27 CDC sources · 4 disease areas  
**Live URL:** https://vitaldocs-ai.vercel.app  
**Public demo:** https://vitaldocs-ai.vercel.app/demo  
**Health check:** https://vitaldocs-ai.vercel.app/api/health  
