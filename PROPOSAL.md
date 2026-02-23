# Project North Star: Health RAG SaaS

## 1. Core Identity & Vibe
**Product Name:** VitalDocs AI
**The Vibe:** "Clinical Trust meets Next-Gen AI." 
The UI should feel incredibly clean, sterile but not boring, trustworthy, and fast. It should look like a premium enterprise healthcare tool—no cluttered dashboards, just a focused, Google-like search experience wrapped in a modern SaaS shell.

---

## 2. Hero Section Copy

- **Overline / Badge:** ✨ Powered by advanced RAG & Clinical Embeddings
- **Headline:** Instant Answers from Trusted Clinical Guidelines.
- **Sub-headline:** Stop digging through dense PDFs. Ask natural language questions and get immediate, cited answers straight from the latest CDC and WHO public health documents.
- **Primary Call-to-Action (CTA):** Start Searching for Free
- **Secondary Call-to-Action:** View Example Queries
- **Social Proof / Trust Strip (Below hero):** "Indexing 50,000+ pages of CDC and WHO documentation."

---

## 3. Color Palette & Typography

### Typography
We need a font pairing that screams "modern tech" but remains highly legible for reading dense medical citations.
- **Primary/Headings:** `Plus Jakarta Sans` or `Inter` (Tight tracking, crisp, highly legible).
- **Body:** `Inter` (Industry standard for clean UI) or `Geist` (Slightly more technical/developer-focused vibe).
- **Monospace/Citations:** `JetBrains Mono` or `Fira Code` (For source tags and reference IDs).

### Color Palette
**Theme:** "Clinical Slate & Bio-Teal"
- **Background (Light Mode Focus):** `Slate 50` (#f8fafc) to pure white (#ffffff). We want a bright, clean, "laboratory" feel.
- **Primary Text:** `Slate 900` (#0f172a) for maximum contrast and readability.
- **Secondary Text:** `Slate 500` (#64748b) for metadata, citations, and timestamps.
- **Primary Brand/Accent Color:** `Teal 600` (#0d9488) or `Cyan 600` (#0891b2). Represents health, tech, and calmness. Used for CTAs and highlighted matches.
- **AI/Magic Accent:** A subtle gradient of `Teal` to `Blue 500` (#3b82f6) for AI generating states or special features.
- **Borders/Dividers:** `Slate 200` (#e2e8f0) for ultra-thin, crisp separation.

---

## 4. UI Component Styling Rules

- **Borders & Radii:** Subtle rounding. `rounded-xl` (approx 12px) for large cards/modals, `rounded-md` (approx 6px) for buttons and inputs. Avoid overly pill-shaped buttons; we want a structured, reliable feel.
- **Shadows:** Extremely soft, diffuse shadows. No harsh drop shadows. Use `shadow-sm` for standard cards and a diffuse `shadow-xl` with a slate tint for floating elements (like the AI response popover).
- **Inputs & Search:** The core feature is search. The main input should be massive, prominently placed in the center of the screen, with a subtle internal glow or border highlight when focused (`ring-2 ring-teal-500/50`).
- **Cards (Chat/Responses):** AI responses should appear in clean white cards on an off-white background. 
- **Citations:** Must look clickable and verifiable. Styled as small pill badges (e.g., `[CDC: 2024 Guidelines]`) with a slight hover state that expands to show the exact PDF page snippet.
- **Animations:** Keep them utilitarian. Fast fade-ins (`duration-150`), smooth skeleton loaders for the AI "thinking" state instead of basic spinners. It should feel snappy.

---

## 5. Next Steps for Design
1. PM to finalize the product name.
2. PM to approve the Hero copy.
3. Once approved, we can search for a Tailwind/Shadcn template that closely matches this "Clinical SaaS" aesthetic to accelerate our 48-hour build.
