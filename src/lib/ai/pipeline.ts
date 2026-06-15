import type {
  ContentGapResult,
  EnhancedPortfolio,
  ParsedResume,
  Project,
  PortfolioStyle,
  RoleDetectionResult,
  RoleType,
  ToneMode,
} from "@/types/portfolio";
import { callOpenAI } from "./client";
import {
  ENHANCE_CONTENT_SYSTEM_PROMPT,
  ENHANCE_SECTION_SYSTEM_PROMPT,
  buildEnhanceUserPrompt,
  buildSectionEnhancePrompt,
  CONTENT_GAP_SYSTEM_PROMPT,
  buildContentGapPrompt,
  ROLE_DETECTION_SYSTEM_PROMPT,
  buildRoleDetectionPrompt,
  TONE_ADJUSTER_SYSTEM_PROMPT,
  buildToneAdjusterPrompt,
  RESUME_PARSE_SYSTEM_PROMPT,
  buildParseUserPrompt,
  IMPROVE_PROJECTS_SYSTEM_PROMPT,
  buildImproveProjectsPrompt,
} from "@/lib/prompts";
import { parseResumeText } from "@/lib/resume-parser";
import type { EditableSection } from "@/types/portfolio";

const ACTION_VERBS = [
  "Built",
  "Developed",
  "Designed",
  "Led",
  "Shipped",
  "Optimized",
  "Implemented",
  "Architected",
  "Delivered",
  "Scaled",
];

function enhanceBullet(text: string, index: number): string {
  const cleaned = text.replace(/^[\s•\-*]+\s*/, "").trim();
  if (!cleaned) return cleaned;
  const startsWithVerb =
    /^[A-Z][a-z]+ed\b/.test(cleaned) || /^[A-Z][a-z]+\b/.test(cleaned);
  if (startsWithVerb) return cleaned.endsWith(".") ? cleaned : cleaned + ".";
  const verb = ACTION_VERBS[index % ACTION_VERBS.length];
  const enhanced = `${verb} ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  return enhanced.endsWith(".") ? enhanced : enhanced + ".";
}

export function inferRoleType(parsed: ParsedResume): RoleType {
  const corpus = [
    parsed.title,
    parsed.about,
    ...parsed.skills.flatMap((s) => s.items),
    ...parsed.experience.map((e) => e.role),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/student|intern|graduate|university|college/.test(corpus)) return "student";
  if (/design|ui|ux|figma|creative/.test(corpus)) return "designer";
  if (/product|pm|manager|strategy/.test(corpus)) return "product";
  if (/data|analyst|ml|machine learning|science/.test(corpus)) return "data";
  if (/marketing|growth|seo|content/.test(corpus)) return "marketing";
  if (/engineer|developer|software|frontend|backend|full.?stack|devops/.test(corpus))
    return "developer";
  return "general";
}

function generateTagline(parsed: ParsedResume, roleType: RoleType): string {
  const title = parsed.title || "Professional";
  const taglines: Record<RoleType, string> = {
    developer: `${title} building reliable, user-focused software`,
    designer: `${title} crafting intuitive experiences that convert`,
    product: `${title} shipping products that drive measurable impact`,
    data: `${title} turning complex data into actionable insights`,
    marketing: `${title} growing brands through data-driven storytelling`,
    student: `${title} eager to apply skills in real-world projects`,
    general: `${title} delivering results through focus and execution`,
  };
  return taglines[roleType];
}

function fallbackGenerateAbout(parsed: ParsedResume, roleType: RoleType): string {
  if (parsed.about && parsed.about.length > 80) return parsed.about;

  const years = parsed.experience.length;
  const skillCount = parsed.skills.reduce((acc, g) => acc + g.items.length, 0);
  const role = parsed.title || "professional";

  const intros: Record<RoleType, string> = {
    developer: `I'm a ${role} with hands-on experience across ${skillCount}+ technologies`,
    designer: `I'm a ${role} passionate about user-centered design`,
    product: `I'm a ${role} focused on aligning user needs with business outcomes`,
    data: `I'm a ${role} skilled at extracting signal from complex datasets`,
    marketing: `I'm a ${role} who blends creativity with performance metrics`,
    student: `I'm a ${role} building skills through projects and coursework`,
    general: `I'm a ${role} committed to high-quality work and continuous growth`,
  };

  const expPart =
    years > 0
      ? `, with ${years} role${years > 1 ? "s" : ""} spanning ${parsed.experience
          .map((e) => e.company)
          .slice(0, 2)
          .join(" and ")}.`
      : ".";

  const projectPart =
    parsed.projects.length > 0
      ? ` I've shipped projects including ${parsed.projects
          .slice(0, 2)
          .map((p) => p.name)
          .join(" and ")}.`
      : "";

  return `${intros[roleType]}${expPart}${projectPart} I bring a recruiter-ready mix of technical depth, clear communication, and outcome-focused delivery.`;
}

export function fallbackEnhance(
  parsed: ParsedResume,
  style: PortfolioStyle,
  roleType: RoleType
): EnhancedPortfolio {
  return {
    ...parsed,
    tagline: generateTagline(parsed, roleType),
    about: fallbackGenerateAbout(parsed, roleType),
    roleType,
    improvements: [],
    skills: parsed.skills.length
      ? parsed.skills
      : [{ category: "Skills", items: ["Communication", "Problem Solving", "Collaboration"] }],
    projects: parsed.projects.map((p, i) => ({
      ...p,
      description:
        p.description ||
        `A ${style === "developer" ? "technical" : "professional"} project demonstrating real-world problem solving.`,
      highlights: p.highlights.length
        ? p.highlights.map((h, j) => enhanceBullet(h, i + j))
        : [enhanceBullet(`Delivered ${p.name} with measurable impact on end users`, i)],
    })),
    experience: parsed.experience.map((e, i) => ({
      ...e,
      description: e.description || `Contributed as ${e.role} at ${e.company}.`,
      achievements: e.achievements.length
        ? e.achievements.map((a, j) => enhanceBullet(a, i + j))
        : [enhanceBullet(e.description || `Drove key initiatives as ${e.role}`, i)],
    })),
    seo: {
      title: `${parsed.name} | ${parsed.title || "Portfolio"}`,
      description: `${parsed.name} — ${generateTagline(parsed, roleType)}. View projects, experience, and skills.`,
      keywords: [
        parsed.name,
        parsed.title || "professional",
        roleType,
        ...parsed.skills.flatMap((s) => s.items).slice(0, 5),
      ].filter(Boolean) as string[],
    },
  };
}

/** STEP 1: Parse resume with heuristic + AI fallback */
export async function parseResumeWithAI(rawText: string): Promise<ParsedResume> {
  const heuristic = parseResumeText(rawText);

  const aiParsed = await callOpenAI<Partial<ParsedResume>>(
    RESUME_PARSE_SYSTEM_PROMPT,
    buildParseUserPrompt(rawText)
  );

  if (!aiParsed) return heuristic;

  return {
    name: aiParsed.name || heuristic.name,
    title: aiParsed.title || heuristic.title,
    about: aiParsed.about || heuristic.about,
    skills: aiParsed.skills?.length ? aiParsed.skills : heuristic.skills,
    projects: aiParsed.projects?.length ? aiParsed.projects : heuristic.projects,
    experience: aiParsed.experience?.length ? aiParsed.experience : heuristic.experience,
    education: aiParsed.education?.length ? aiParsed.education : heuristic.education,
    contact: { ...heuristic.contact, ...aiParsed.contact },
    rawText,
  };
}

/** AI Function 2: RoleDetection */
export async function detectRole(parsed: ParsedResume): Promise<RoleDetectionResult> {
  const result = await callOpenAI<RoleDetectionResult>(
    ROLE_DETECTION_SYSTEM_PROMPT,
    buildRoleDetectionPrompt(parsed as unknown as Record<string, unknown>)
  );

  if (!result) {
    const roleType = inferRoleType(parsed);
    return {
      roleType,
      confidence: 0.6,
      reasoning: `Inferred from skills and experience keywords (${roleType}).`,
    };
  }

  return result;
}

/** AI Function 1: EnhanceContent */
export async function enhanceContent(
  parsed: ParsedResume,
  style: PortfolioStyle,
  tone: ToneMode,
  roleType: RoleType
): Promise<Partial<EnhancedPortfolio>> {
  const aiEnhanced = await callOpenAI<Partial<EnhancedPortfolio>>(
    ENHANCE_CONTENT_SYSTEM_PROMPT,
    buildEnhanceUserPrompt(parsed as unknown as Record<string, unknown>, style, tone)
  );

  if (!aiEnhanced) {
    return fallbackEnhance(parsed, style, roleType);
  }

  return {
    ...parsed,
    tagline: aiEnhanced.tagline || generateTagline(parsed, roleType),
    about: aiEnhanced.about || fallbackGenerateAbout(parsed, roleType),
    roleType,
    skills: aiEnhanced.skills?.length ? aiEnhanced.skills : parsed.skills,
    projects: aiEnhanced.projects?.length ? aiEnhanced.projects : parsed.projects,
    experience: aiEnhanced.experience?.length ? aiEnhanced.experience : parsed.experience,
    education: aiEnhanced.education?.length ? aiEnhanced.education : parsed.education,
    improvements: [],
    seo: aiEnhanced.seo || {
      title: `${parsed.name} | ${parsed.title || "Portfolio"}`,
      description:
        aiEnhanced.about?.slice(0, 155) || fallbackGenerateAbout(parsed, roleType).slice(0, 155),
      keywords: [parsed.name, parsed.title || "", roleType].filter(Boolean) as string[],
    },
  };
}

/** AI Function 3: ContentGapAnalyzer */
export async function analyzeContentGaps(parsed: ParsedResume): Promise<ContentGapResult> {
  const result = await callOpenAI<ContentGapResult>(
    CONTENT_GAP_SYSTEM_PROMPT,
    buildContentGapPrompt(parsed as unknown as Record<string, unknown>)
  );

  if (!result) {
    const missing: string[] = [];
    if (!parsed.about || parsed.about.length < 50) missing.push("summary");
    if (parsed.projects.length === 0) missing.push("projects");
    if (parsed.skills.length === 0) missing.push("skills");
    return {
      missingSections: missing,
      suggestions: [
        "Add quantified achievements to experience bullets",
        "Include 2-3 projects with technologies and outcomes",
        "Write a compelling professional summary",
      ],
      score: 60,
    };
  }

  return result;
}

/** AI Function 4: ToneAdjuster */
export async function adjustTone(
  content: EnhancedPortfolio,
  tone: ToneMode
): Promise<Partial<EnhancedPortfolio>> {
  const adjusted = await callOpenAI<Partial<EnhancedPortfolio>>(
    TONE_ADJUSTER_SYSTEM_PROMPT,
    buildToneAdjusterPrompt(content as unknown as Record<string, unknown>, tone)
  );

  return adjusted || content;
}

/** AI Function 5 — ImproveProjects: dedicated project enhancer */
export async function improveProjects(
  projects: Project[],
  tone: ToneMode,
  roleType: RoleType
): Promise<Project[]> {
  const result = await callOpenAI<{ projects: Project[] }>(
    IMPROVE_PROJECTS_SYSTEM_PROMPT,
    buildImproveProjectsPrompt(projects, tone, roleType),
    0.5
  );

  if (!result?.projects?.length) return projects;
  return result.projects;
}

/** AI Function 6 — GenerateAbout: standalone callable about generator */
export async function generateAboutSection(
  parsed: ParsedResume,
  tone: ToneMode,
  roleType: RoleType
): Promise<string> {
  const prompt = `Write a compelling About Me paragraph for a ${roleType} with ${tone} tone.

Resume data:
${JSON.stringify(
  {
    name: parsed.name,
    title: parsed.title,
    skills: parsed.skills,
    experience: parsed.experience.map((e) => ({ role: e.role, company: e.company })),
    projects: parsed.projects.map((p) => p.name),
  },
  null,
  2
)}

Return ONLY valid JSON: { "about": "3-4 sentence first-person paragraph. Confident, specific, recruiter-focused." }`;

  const result = await callOpenAI<{ about: string }>(
    `You are a career copywriter. Write compelling About sections for portfolios. Return only JSON.`,
    prompt,
    0.6
  );

  if (!result?.about) return fallbackGenerateAbout(parsed, roleType);
  return result.about;
}


export async function regenerateSection(
  section: EditableSection,
  content: unknown,
  tone: ToneMode,
  roleType: RoleType
): Promise<unknown> {
  const result = await callOpenAI<Record<string, unknown>>(
    ENHANCE_SECTION_SYSTEM_PROMPT,
    buildSectionEnhancePrompt(section, content, tone, roleType)
  );

  if (!result) return content;

  // Section responses may wrap in section key or return directly
  if (section in result) return result[section];
  return result;
}

/** Full pipeline orchestrator */
export async function runPortfolioPipeline(
  rawText: string,
  style: PortfolioStyle,
  tone: ToneMode
): Promise<{
  userData: ParsedResume;
  aiEnhancedData: EnhancedPortfolio;
  contentGaps: ContentGapResult;
}> {
  const userData = await parseResumeWithAI(rawText);
  const roleResult = await detectRole(userData);
  const enhanced = await enhanceContent(userData, style, tone, roleResult.roleType);
  const toned = await adjustTone(enhanced as EnhancedPortfolio, tone);
  const contentGaps = await analyzeContentGaps(userData);

  const aiEnhancedData: EnhancedPortfolio = {
    ...userData,
    tagline: toned.tagline || enhanced.tagline || generateTagline(userData, roleResult.roleType),
    about: toned.about || enhanced.about || fallbackGenerateAbout(userData, roleResult.roleType),
    roleType: roleResult.roleType,
    skills: toned.skills || enhanced.skills || userData.skills,
    projects: toned.projects || enhanced.projects || userData.projects,
    experience: toned.experience || enhanced.experience || userData.experience,
    education: toned.education || enhanced.education || userData.education,
    improvements: contentGaps.suggestions,
    seo:
      enhanced.seo ||
      fallbackEnhance(userData, style, roleResult.roleType).seo,
  };

  return { userData, aiEnhancedData, contentGaps };
}

export async function generateAbout(
  parsed: ParsedResume,
  tone: ToneMode,
  roleType: RoleType
): Promise<string> {
  return generateAboutSection(parsed, tone, roleType);
}

export async function analyzeGaps(parsed: ParsedResume): Promise<ContentGapResult> {
  return analyzeContentGaps(parsed);
}
