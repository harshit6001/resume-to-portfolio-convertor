import { NextRequest, NextResponse } from "next/server";
import { regenerateSection } from "@/lib/ai/pipeline";
import { isAIEnabled } from "@/lib/ai/client";
import type { EditableSection, ToneMode, RoleType } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENAI_API_KEY to enable regeneration." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { section, content, tone, roleType } = body as {
      section: EditableSection;
      content: unknown;
      tone: ToneMode;
      roleType: RoleType;
    };

    if (!section || !content) {
      return NextResponse.json({ error: "Missing section or content" }, { status: 400 });
    }

    const enhanced = await regenerateSection(
      section,
      content,
      tone || "professional",
      roleType || "general"
    );

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Regeneration failed" },
      { status: 500 }
    );
  }
}
