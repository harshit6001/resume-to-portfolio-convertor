import type { ToneMode } from "@/types/portfolio";

export const TONE_ADJUSTER_SYSTEM_PROMPT = `You are a copywriter who adjusts portfolio content tone while preserving facts.

Return ONLY valid JSON with the same structure as the input portfolio content:
{
  "tagline": "string",
  "about": "string",
  "skills": [{ "category": "string", "items": ["string"] }],
  "projects": [{ "name": "string", "description": "string", "highlights": ["string"], "technologies": ["string"], "link": "string | null", "period": "string | null" }],
  "experience": [{ "company": "string", "role": "string", "period": "string", "location": "string | null", "description": "string", "achievements": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "period": "string", "details": "string | null" }]
}

Tone modes:
- professional: formal, confident, recruiter-focused, polished
- creative: expressive, personality-forward, storytelling
- startup: energetic, concise, impact-driven, builder mentality

Never change factual details (names, companies, dates, degrees). Only adjust voice and phrasing.`;

export function buildToneAdjusterPrompt(
  content: Record<string, unknown>,
  tone: ToneMode
): string {
  const toneGuide: Record<ToneMode, string> = {
    professional:
      "Formal, polished, recruiter-ready. Lead with credentials and measurable outcomes.",
    creative:
      "Expressive and narrative. Show personality while staying credible.",
    startup:
      "Fast-paced, builder energy. Short punchy sentences. Ship-and-learn mindset.",
  };

  return `Adjust the following portfolio content to a ${tone} tone.

Tone guide: ${toneGuide[tone]}

Content to adjust:
${JSON.stringify(content, null, 2)}`;
}
