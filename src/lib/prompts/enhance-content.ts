import type { PortfolioStyle, ToneMode } from "@/types/portfolio";

export const ENHANCE_CONTENT_SYSTEM_PROMPT = `You are a senior career coach and portfolio copywriter who transforms resumes into recruiter-optimized personal brand narratives.

Your job: take parsed resume data and produce portfolio-ready content that is specific, achievement-oriented, and metric-driven where possible.

Return ONLY valid JSON:
{
  "tagline": "Compelling 8-12 word professional tagline",
  "about": "3-4 sentence About Me paragraph. First person. Confident, specific, recruiter-focused.",
  "skills": [{ "category": "string", "items": ["string"] }],
  "projects": [{
    "name": "string",
    "description": "2-3 sentence project narrative with impact",
    "highlights": ["Achievement bullets with metrics/results where possible"],
    "technologies": ["string"],
    "link": "string or null",
    "period": "string or null"
  }],
  "experience": [{
    "company": "string",
    "role": "string",
    "period": "string",
    "location": "string or null",
    "description": "1 sentence role summary",
    "achievements": ["Strong action-verb bullets with quantified results"]
  }],
  "education": [{ "institution": "string", "degree": "string", "period": "string", "details": "string or null" }],
  "seo": {
    "title": "Name | Role — Portfolio",
    "description": "155-char meta description for recruiters",
    "keywords": ["5-8 relevant keywords"]
  }
}

Writing rules:
- Use strong action verbs: Built, Led, Shipped, Optimized, Designed, Scaled
- Add realistic metrics when the resume implies scale (users, %, time saved) — mark estimates with "~" if inferred
- Never invent fake companies, degrees, or job titles
- Keep bullets scannable — max 2 lines each
- Projects should read like case studies, not task lists`;

export function buildEnhanceUserPrompt(
  parsed: Record<string, unknown>,
  style: PortfolioStyle,
  tone: ToneMode
): string {
  return `Enhance this parsed resume for a ${style} portfolio layout with ${tone} tone.

Parsed resume data:
${JSON.stringify(parsed, null, 2)}

Transform weak bullets into achievement statements. Generate a compelling tagline and About section.`;
}

export function buildSectionEnhancePrompt(
  section: string,
  content: unknown,
  tone: ToneMode,
  roleType: string
): string {
  return `Enhance ONLY the "${section}" section for a ${roleType} portfolio with ${tone} tone.

Current content:
${JSON.stringify(content, null, 2)}

Return ONLY valid JSON with the enhanced section content in the same structure. Do not change factual details (companies, dates, degrees). Improve writing quality, add impact metrics where implied.`;
}

export const ENHANCE_SECTION_SYSTEM_PROMPT = `You are a portfolio copywriter. Enhance a single portfolio section while preserving factual accuracy.

Return ONLY valid JSON matching the input structure for that section type. Never fabricate employers, degrees, or projects.`;
