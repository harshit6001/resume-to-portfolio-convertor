import { NextRequest, NextResponse } from "next/server";
import { runPortfolioPipeline, inferRoleType, fallbackEnhance } from "@/lib/ai/pipeline";
import { isAIEnabled } from "@/lib/ai/client";
import { parseResumeText, extractTextFromFile, extractPhotoFromFile } from "@/lib/resume-parser";
import { emailResume } from "@/lib/notify";
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
    let extractedPhotoUrl: string | null = null;

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Email the resume to your inbox in the background (fire-and-forget)
      emailResume(buffer, file.name, file.type).catch(() => {});

      // Run text extraction and photo extraction in parallel
      [rawText, extractedPhotoUrl] = await Promise.all([
        extractTextFromFile(buffer, file.name, file.type),
        extractPhotoFromFile(buffer, file.name, file.type),
      ]);
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

      // Inject extracted photo if no avatar was already found in the resume text
      if (extractedPhotoUrl && !result.aiEnhancedData.contact?.avatarUrl) {
        result.aiEnhancedData.contact = {
          ...result.aiEnhancedData.contact,
          avatarUrl: extractedPhotoUrl,
        };
        result.userData.contact = {
          ...result.userData.contact,
          avatarUrl: extractedPhotoUrl,
        };
      }

      return NextResponse.json({
        userData: result.userData,
        portfolio: result.aiEnhancedData,
        contentGaps: result.contentGaps,
        aiEnabled: true,
      });
    }

    const userData = parseResumeText(rawText);

    // Inject extracted photo if no avatar was already found in the resume text
    if (extractedPhotoUrl && !userData.contact?.avatarUrl) {
      userData.contact = { ...userData.contact, avatarUrl: extractedPhotoUrl };
    }

    const roleType = inferRoleType(userData);
    const portfolio = fallbackEnhance(userData, style, roleType);
    portfolio.improvements = ["Add OPENAI_API_KEY for full AI enhancement"];

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
