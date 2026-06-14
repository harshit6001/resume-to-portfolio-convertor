import { NextRequest, NextResponse } from "next/server";
import { adjustTone } from "@/lib/ai/pipeline";
import { isAIEnabled } from "@/lib/ai/client";
import type { EnhancedPortfolio, ToneMode } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENAI_API_KEY to enable tone adjustment." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { content, tone } = body as { content: EnhancedPortfolio; tone: ToneMode };

    if (!content || !tone) {
      return NextResponse.json({ error: "Missing content or tone" }, { status: 400 });
    }

    const adjusted = await adjustTone(content, tone);

    return NextResponse.json({ adjusted });
  } catch (error) {
    console.error("Tone adjust error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tone adjustment failed" },
      { status: 500 }
    );
  }
}
