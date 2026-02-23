# VitalDocs AI - RAG Corpus

## Domain Focus: Infectious Diseases (Measles, Mumps, Rubella)
**Target Audience:** US Healthcare Professionals
**Source Authority:** Centers for Disease Control and Prevention (CDC)

## Document Sources for Ingestion

### 1. The "Pink Book" (Comprehensive Guidelines)
- **Title:** Measles, Mumps, and Rubella Vaccines (2024)
- **Type:** PDF
- **URL:** https://www2.cdc.gov/vaccines/ed/pinkbook/2024/pb9/PB_MMR.pdf
- **Content:** Pathogenesis, clinical features, epidemiology, and vaccination protocols.

### 2. Clinical Overviews (Point-of-Care Diagnostics)
- **Title:** Clinical Overview of Measles
- **Type:** Web (HTML)
- **URL:** https://www.cdc.gov/measles/hcp/clinical-overview/index.html
- **Content:** Symptom identification, laboratory testing, and treatment.

### 3. Infection Control & Exposure Protocols
- **Title:** Measles | Infection Control in Healthcare Settings
- **Type:** Web (HTML)
- **URL:** https://www.cdc.gov/infection-control/hcp/healthcare-personnel-epidemiology-control/measles.html
- **Content:** Daily monitoring, isolation protocols, and post-exposure prophylaxis.

## Technical Plan
1. **Ingestion Script:** Node.js script using `pdf-parse` and `cheerio` (for HTML) to extract raw text.
2. **Chunking:** Split text into ~500-1000 token chunks with 100 token overlap.
3. **Embedding:** `text-embedding-3-small` (OpenAI).
4. **Storage:** `pgvector` (via local Docker Postgres or Neon Serverless).
