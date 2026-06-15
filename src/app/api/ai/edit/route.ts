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
4. CHANGE UI / APPEARANCE (e.g. change color to emerald, hide the metrics section, change template to minimal). You must set the correct fields in the uiOverrides object.
5. GENERATE OR REPLACE IMAGES (e.g. generate a profile picture of a tech engineer, change the project photo to an ecommerce dashboard mockup). You must set the relevant image fields to a Pollinations AI generation URL:
   "https://image.pollinations.ai/prompt/{urlEncodedPrompt}?width=600&height=400&nologo=true&private=true"
   You must construct a highly descriptive, detailed, aesthetic prompt tailored to the context (e.g. 'professional developer headshot, warm lighting, 8k' or 'modern SaaS dashboard mockup UI design, dark mode, high resolution vector') and fully URL-encode it inside the URL (replacing spaces with %20, etc.).

Follow these strict constraints:
- NEVER invent new employers or degrees unless the user specifically asks you to add a new job/degree.
- Keep links, URLs, and structures intact.
- Keep dates intact unless instructed otherwise.
- Preserve all fields that are not affected by the user's instructions.
- If the user asks to generate, change, or replace any image (avatar/profile picture or project image), you MUST construct and assign the Pollinations URL.
- Ensure the output strictly conforms to the JSON schema. Do not return markdown, comments, or explanations outside the JSON object.

Return ONLY valid JSON matching this schema:
{
  "name": "string",
  "title": "string",
  "tagline": "string",
  "about": "string",
  "roleType": "developer | designer | product | data | marketing | student | general",
  "skills": [{ "category": "string", "items": ["string"] }],
  "projects": [{ "name": "string", "description": "string", "highlights": ["string"], "technologies": ["string"], "link": "string", "period": "string", "imageUrl": "string" }],
  "experience": [{ "company": "string", "role": "string", "period": "string", "location": "string", "description": "string", "achievements": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "period": "string", "details": "string" }],
  "contact": { "email": "string", "phone": "string", "location": "string", "linkedin": "string", "github": "string", "website": "string", "avatarUrl": "string" },
  "seo": {
    "title": "string",
    "description": "string (155 chars max)",
    "keywords": ["string"]
  },
  "uiOverrides": {
    "accentColor": "violet | emerald | amber | null",
    "template": "minimal | developer | creative",
    "hideMetrics": true | false
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
      uiOverrides: edited.uiOverrides ? { ...content.uiOverrides, ...edited.uiOverrides } : content.uiOverrides,
      improvements: [
        ...(content.improvements || []),
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
