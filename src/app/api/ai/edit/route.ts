import { NextRequest, NextResponse } from "next/server";
import { isAIEnabled, callOpenAI } from "@/lib/ai/client";
import type { EnhancedPortfolio } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENAI_API_KEY to enable AI edits." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { content, instruction } = body as { content: EnhancedPortfolio; instruction: string };

    if (!content) {
      return NextResponse.json({ error: "Missing content draft" }, { status: 400 });
    }
    if (!instruction) {
      return NextResponse.json({ error: "Missing edit instruction" }, { status: 400 });
    }

    const systemPrompt = `You are an expert JSON data editor and career portfolio architect.
Your job is to apply a user's natural language command directly and precisely to their portfolio JSON data structure.

The user's command may ask you to:
1. ADD something (e.g. add a new project, a new experience job, a education history, or a new skill category/item). You must generate realistic, high-quality, impressive professional details for the fields, fitting the context of the user's role.
2. REMOVE something (e.g. remove a specific project, delete a skill, clear an achievement bullet). You must find and remove the matching element from the arrays.
3. IMPLEMENT / MODIFY something (e.g. rewrite biography to sound founder-focused, translate whole site, add a metrics estimate to a project, format description). You must rewrite the fields directly.

Follow these strict constraints:
- NEVER invent new employers or degrees unless the user specifically asks you to add a new job/degree.
- Keep links, URLs, and structures intact.
- Keep dates intact unless instructed otherwise.
- Preserve all fields that are not affected by the user's instructions.
- Ensure the output strictly conforms to the JSON schema. Do not return markdown, comments, or explanations outside the JSON object.

Return ONLY valid JSON matching this schema:
{
  "name": "string",
  "title": "string",
  "tagline": "string",
  "about": "string",
  "roleType": "developer | designer | product | data | marketing | student | general",
  "skills": [{ "category": "string", "items": ["string"] }],
  "projects": [{ "name": "string", "description": "string", "highlights": ["string"], "technologies": ["string"], "link": "string", "period": "string" }],
  "experience": [{ "company": "string", "role": "string", "period": "string", "location": "string", "description": "string", "achievements": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "period": "string", "details": "string" }],
  "contact": { "email": "string", "phone": "string", "location": "string", "linkedin": "string", "github": "string", "website": "string" },
  "seo": {
    "title": "string",
    "description": "string (155 chars max)",
    "keywords": ["string"]
  }
}`;

    const userPrompt = `Apply the following edit command to this portfolio:
Command: "${instruction}"

Current Portfolio JSON:
${JSON.stringify(content, null, 2)}`;

    const edited = await callOpenAI<Partial<EnhancedPortfolio>>(
      systemPrompt,
      userPrompt,
      0.4
    );

    if (!edited) {
      throw new Error("AI copilot returned empty response");
    }

    // Merge and sanitize keeping fields intact
    const result: EnhancedPortfolio = {
      ...content,
      name: edited.name || content.name,
      title: edited.title || content.title,
      tagline: edited.tagline || content.tagline,
      about: edited.about || content.about,
      roleType: edited.roleType || content.roleType,
      skills: (edited.skills as unknown as EnhancedPortfolio["skills"]) || content.skills,
      projects: (edited.projects as unknown as EnhancedPortfolio["projects"]) || content.projects,
      experience: (edited.experience as unknown as EnhancedPortfolio["experience"]) || content.experience,
      education: (edited.education as unknown as EnhancedPortfolio["education"]) || content.education,
      contact: edited.contact ? { ...content.contact, ...edited.contact } : content.contact,
      seo: edited.seo ? { ...content.seo, ...edited.seo } : content.seo,
      improvements: [
        ...content.improvements,
        `AI edit command applied: "${instruction.slice(0, 40)}${instruction.length > 40 ? '...' : ''}"`
      ]
    };

    return NextResponse.json({ edited: result });
  } catch (error) {
    console.error("AI Copilot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI Copilot editing failed" },
      { status: 500 }
    );
  }
}
