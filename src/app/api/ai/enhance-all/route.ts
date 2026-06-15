import { NextRequest, NextResponse } from "next/server";
import { isAIEnabled, callOpenAI } from "@/lib/ai/client";
import type { EnhancedPortfolio, ToneMode } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENAI_API_KEY to enable Auto-Enhancement." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { content, tone } = body as { content: EnhancedPortfolio; tone: ToneMode };

    if (!content) {
      return NextResponse.json({ error: "Missing content draft" }, { status: 400 });
    }

    const systemPrompt = `You are a senior executive career coach and elite portfolio copywriter.
Your job is to take a complete draft of a portfolio website and perform a comprehensive global rewrite to make it highly impressive to recruiters and clients.

Follow these strict guidelines:
1. Tone adjustment: Format all writing to match a "${tone || 'professional'}" style (e.g. professional = polished & recruiter-focused, creative = expressive & storytelling, startup = punchy & metric-driven).
2. Factual preservation: NEVER invent new employers, universities, project links, or job titles. Keep dates intact.
3. Quantifiable Impact: Infuse specific, realistic business metrics (e.g. "reduced API latency by ~35%", "increased click-through rate by ~14%", "supported a team of ~6 engineers") where implied. Always prefix estimated metrics with "~" to keep them honest.
4. Project Narratives: Rewrite project descriptions to read like short case studies (Problem → Action → Business Result) instead of static feature lists. Keep achievements/highlights to short 1-2 line bullets.
5. Hero Tags: Optimize the profile tagline (8-12 words) to be memorable.

Return ONLY valid JSON matching this schema:
{
  "tagline": "string",
  "about": "string",
  "skills": [{ "category": "string", "items": ["string"] }],
  "projects": [{ "name": "string", "description": "string", "highlights": ["string"], "technologies": ["string"], "link": "string | null", "period": "string | null" }],
  "experience": [{ "company": "string", "role": "string", "period": "string", "location": "string | null", "description": "string", "achievements": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "period": "string", "details": "string | null" }],
  "seo": {
    "title": "string",
    "description": "string (155 chars max)",
    "keywords": ["string"]
  }
}`;

    const userPrompt = `Enhance the entire portfolio website:
Current Portfolio Content:
${JSON.stringify(content, null, 2)}

Adjust tone, inject quantified metrics, expand projects into case studies, and optimize all copywriting. Return the complete updated JSON.`;

    const enhanced = await callOpenAI<Partial<EnhancedPortfolio>>(
      systemPrompt,
      userPrompt,
      0.5
    );

    if (!enhanced) {
      throw new Error("AI enhancement returned empty response");
    }

    // Merge keeping original contact data and raw text
    const result: EnhancedPortfolio = {
      ...content,
      tagline: enhanced.tagline || content.tagline,
      about: enhanced.about || content.about,
      skills: (enhanced.skills as unknown as EnhancedPortfolio["skills"]) || content.skills,
      projects: (enhanced.projects as unknown as EnhancedPortfolio["projects"]) || content.projects,
      experience: (enhanced.experience as unknown as EnhancedPortfolio["experience"]) || content.experience,
      education: (enhanced.education as unknown as EnhancedPortfolio["education"]) || content.education,
      seo: enhanced.seo ? { ...content.seo, ...enhanced.seo } : content.seo,
      improvements: [
        "AI Auto-Enhance completed successfully!",
        "Narratives polished to " + (tone || "professional") + " tone",
        "Achievements optimized with quantified impact metrics"
      ]
    };

    return NextResponse.json({ enhanced: result });
  } catch (error) {
    console.error("Auto-enhance error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI Auto-Enhancement failed" },
      { status: 500 }
    );
  }
}
