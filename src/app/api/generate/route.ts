import { NextRequest, NextResponse } from "next/server";
import { runPortfolioPipeline } from "@/lib/ai/pipeline";
import { isAIEnabled } from "@/lib/ai/client";
import { parseResumeText, extractTextFromFile } from "@/lib/resume-parser";
import type { PortfolioStyle, ToneMode } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const style = (formData.get("style") as PortfolioStyle) || "minimal";
    const tone = (formData.get("tone") as ToneMode) || "professional";

    let rawText = "";

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractTextFromFile(buffer, file.name, file.type);
    } else if (text) {
      rawText = text;
    } else {
      return NextResponse.json(
        { error: "Please provide a resume file or text." },
        { status: 400 }
      );
    }

    if (!rawText.trim() || rawText.trim().length < 30) {
      return NextResponse.json(
        { error: "Resume content is too short to parse." },
        { status: 400 }
      );
    }

    if (isAIEnabled()) {
      const result = await runPortfolioPipeline(rawText, style, tone);
      return NextResponse.json({
        userData: result.userData,
        portfolio: result.aiEnhancedData,
        contentGaps: result.contentGaps,
        aiEnabled: true,
      });
    }

    const userData = parseResumeText(rawText);
    const portfolio = {
      ...userData,
      tagline: userData.title || "Professional Portfolio",
      about: userData.about || "Experienced professional ready for new opportunities.",
      roleType: "general" as const,
      improvements: ["Add OPENAI_API_KEY for full AI enhancement"],
      seo: {
        title: `${userData.name} | Portfolio`,
        description: `${userData.name} — professional portfolio`,
        keywords: [userData.name],
      },
    };

    return NextResponse.json({
      userData,
      portfolio,
      contentGaps: null,
      aiEnabled: false,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process resume. Please try again.",
      },
      { status: 500 }
    );
  }
}
