# AI Resume → Smart Portfolio Builder

Production-grade AI SaaS that parses resumes, enhances content through a modular AI pipeline, and generates editable portfolio websites with live preview, versioning, and one-click Vercel export.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## Features

| Feature | Description |
|---------|-------------|
| **Resume Parsing** | PDF, DOCX, and plain text via `pdf-parse` + `mammoth` + AI fallback |
| **Modular AI Pipeline** | 4 separate AI functions — not one monolithic prompt |
| **Live Editing** | Inline Notion-style editing with per-section AI regeneration |
| **Original + Enhanced** | Always preserves original parsed content alongside AI output |
| **3 Templates** | Developer (GitHub-style), Creative (visual), Minimal Professional |
| **3 Tone Modes** | Professional, Creative, Startup-style |
| **Versioning** | Save v1, v2, v3 — revert anytime |
| **Vercel Export** | Download HTML or full deploy-ready ZIP package |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER UPLOAD                             │
│              PDF / DOCX / Text                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 1: RESUME PARSING LAYER                                   │
│  src/lib/resume-parser.ts                                       │
│  • Heuristic section detection (regex + structure)              │
│  • pdf-parse (PDF) + mammoth (DOCX)                             │
│  • AI fallback: parseResumeWithAI()                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ ParsedResume (userData)
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 2: AI PROCESSING LAYER (modular)                          │
│  src/lib/ai/pipeline.ts                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │ RoleDetection│ │EnhanceContent│ │ContentGap   │ │Tone     │ │
│  │              │ │              │ │Analyzer     │ │Adjuster │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ EnhancedPortfolio (aiEnhancedData)
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 3: STATE MANAGEMENT (Zustand)                             │
│  src/store/portfolio-store.ts                                   │
│  { userData, aiEnhancedData, editedData, template, tone,        │
│    versions[] }                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 4: DYNAMIC WEBSITE GENERATOR                              │
│  src/components/portfolio/sections/                             │
│  Hero · About · Skills · Projects · Experience · Contact        │
│  → DynamicPortfolio (role + content driven)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 5: LIVE EDIT + REGENERATE                                 │
│  src/components/editor/                                         │
│  InlineEditor · EditSidebar · RegenerateButton                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 6: PREVIEW + VERSIONING + EXPORT                          │
│  PreviewPanel · VersionHistory · export.ts (HTML + ZIP)         │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
resume-to-portfolio-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts       # Full pipeline endpoint
│   │   │   └── ai/
│   │   │       ├── regenerate/route.ts # Per-section AI regen
│   │   │       └── tone/route.ts       # Tone adjustment
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── builder/                    # BuilderApp, PreviewPanel, StyleSelector
│   │   ├── editor/                     # InlineEditor, EditSidebar, VersionHistory
│   │   ├── portfolio/
│   │   │   ├── sections/               # Reusable section components
│   │   │   ├── DynamicPortfolio.tsx
│   │   │   └── PortfolioRenderer.tsx
│   │   └── upload/                     # ResumeUploader
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts               # OpenAI client wrapper
│   │   │   └── pipeline.ts             # Modular AI orchestrator
│   │   ├── prompts/                    # Separate prompts per AI function
│   │   ├── resume-parser.ts            # PDF/DOCX/text parsing
│   │   └── export.ts                   # HTML + Vercel ZIP export
│   ├── store/
│   │   └── portfolio-store.ts          # Zustand state management
│   └── types/
│       └── portfolio.ts
├── .env.example
└── README.md
```

## AI Functions & Prompts

Each function has its own prompt in `src/lib/prompts/`:

### 1. EnhanceContent (`enhance-content.ts`)
Improves writing, adds impact metrics, converts bullets to strong descriptions.

### 2. RoleDetection (`role-detection.ts`)
Detects: developer, designer, product, data, marketing, student, general.

### 3. ContentGapAnalyzer (`content-gap.ts`)
Identifies missing sections, suggests improvements, scores portfolio readiness.

### 4. ToneAdjuster (`tone-adjuster.ts`)
Modes: professional, creative, startup.

## Run Locally

```bash
cd resume-to-portfolio-ai
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option A — Deploy the SaaS App

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set `OPENAI_API_KEY` environment variable
4. Deploy

### Option B — Deploy Generated Portfolio

1. Generate portfolio in the app
2. Click **Export Vercel Package**
3. Upload ZIP to Vercel or run `vercel deploy` in extracted folder

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | — | Enables full AI pipeline |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model |

Without `OPENAI_API_KEY`, the app runs in smart fallback mode with heuristic parsing and rule-based enhancement.

## License

MIT
