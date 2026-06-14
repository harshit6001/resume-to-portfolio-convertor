import { NextRequest, NextResponse } from "next/server";
import { improveProjects } from "@/lib/ai/pipeline";
import { isAIEnabled } from "@/lib/ai/client";
import type { ToneMode, RoleType, Project } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENAI_API_KEY to enable project improvement." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { projects, tone, roleType } = body as {
      projects: Project[];
      tone: ToneMode;
      roleType: RoleType;
    };

    if (!projects?.length) {
      return NextResponse.json({ error: "Missing projects array" }, { status: 400 });
    }

    const improved = await improveProjects(
      projects,
      tone || "professional",
      roleType || "general"
    );

    return NextResponse.json({ improved });
  } catch (error) {
    console.error("Improve projects error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Project improvement failed" },
      { status: 500 }
    );
  }
}
