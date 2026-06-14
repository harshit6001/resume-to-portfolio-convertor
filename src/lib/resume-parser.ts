import type {
  ContactInfo,
  Education,
  Experience,
  ParsedResume,
  Project,
  SkillGroup,
} from "@/types/portfolio";
import {
  capitalizeWords,
  extractEmail,
  extractGitHub,
  extractLinkedIn,
  extractPhone,
  extractUrl,
} from "./utils";

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  experience: [
    /^(?:work\s+)?experience$/i,
    /^employment$/i,
    /^professional\s+experience$/i,
    /^work\s+history$/i,
  ],
  education: [/^education$/i, /^academic$/i, /^qualifications$/i],
  skills: [
    /^skills?$/i,
    /^technical\s+skills?$/i,
    /^core\s+competencies$/i,
    /^technologies$/i,
  ],
  projects: [/^projects?$/i, /^personal\s+projects?$/i, /^portfolio$/i],
  about: [
    /^about$/i,
    /^summary$/i,
    /^profile$/i,
    /^objective$/i,
    /^professional\s+summary$/i,
  ],
};

function matchesSection(line: string, section: string): boolean {
  const trimmed = line.trim().replace(/[:\-#*]+$/g, "").trim();
  return SECTION_PATTERNS[section]?.some((p) => p.test(trimmed)) ?? false;
}

function splitIntoSections(text: string): Record<string, string[]> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: Record<string, string[]> = {
    header: [],
    about: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    other: [],
  };

  let current = "header";

  for (const line of lines) {
    let matched = false;
    for (const key of Object.keys(SECTION_PATTERNS)) {
      if (matchesSection(line, key)) {
        current = key;
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections[current].push(line);
    }
  }

  return sections;
}

function extractName(headerLines: string[]): string {
  for (const line of headerLines.slice(0, 5)) {
    if (
      line.length > 2 &&
      line.length < 60 &&
      !line.includes("@") &&
      !/^\d/.test(line) &&
      !/linkedin|github|http/i.test(line)
    ) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 5) {
        return capitalizeWords(line);
      }
    }
  }
  return "Your Name";
}

function extractTitle(headerLines: string[], aboutLines: string[]): string | undefined {
  const candidates = [...headerLines.slice(1, 4), ...aboutLines.slice(0, 1)];
  for (const line of candidates) {
    if (
      line.length > 5 &&
      line.length < 80 &&
      !line.includes("@") &&
      !/^\d/.test(line)
    ) {
      return line;
    }
  }
  return undefined;
}

function parseSkillsBlock(lines: string[]): SkillGroup[] {
  const text = lines.join("\n");
  const groups: SkillGroup[] = [];

  const categoryPattern = /^([A-Za-z\s/&]+):\s*(.+)$/;
  let hasCategories = false;

  for (const line of lines) {
    const match = line.match(categoryPattern);
    if (match) {
      hasCategories = true;
      groups.push({
        category: match[1].trim(),
        items: match[2].split(/[,;|•·]/).map((s) => s.trim()).filter(Boolean),
      });
    }
  }

  if (!hasCategories) {
    const items = text
      .split(/[,;|•·\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40);
    if (items.length) {
      groups.push({ category: "Core Skills", items: [...new Set(items)] });
    }
  }

  return groups;
}

function parseBulletPoints(lines: string[]): string[] {
  return lines
    .map((l) => l.replace(/^[\s•\-*–—]+\s*/, "").trim())
    .filter((l) => l.length > 5);
}

function parseExperienceBlock(lines: string[]): Experience[] {
  const experiences: Experience[] = [];
  const datePattern =
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-–—]\s*(\b(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|Present|Current)/i;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const dateMatch = line.match(datePattern);

    if (dateMatch || (i + 1 < lines.length && lines[i + 1].match(datePattern))) {
      const roleLine = dateMatch ? lines[i] : line;
      const periodMatch = (dateMatch ? line : lines[i + 1]).match(datePattern);

      let company = "";
      let role = roleLine;
      const parts = roleLine.split(/\s+[-–—|@]\s+/);
      if (parts.length >= 2) {
        role = parts[0].trim();
        company = parts.slice(1).join(" - ").replace(datePattern, "").trim();
      } else if (i > 0) {
        company = lines[i - 1];
      }

      const achievements: string[] = [];
      i += dateMatch ? 1 : 2;

      while (i < lines.length && !lines[i].match(datePattern) && !matchesSection(lines[i], "experience")) {
        if (/^[\s•\-*]/.test(lines[i]) || achievements.length > 0) {
          achievements.push(...parseBulletPoints([lines[i]]));
        }
        i++;
        if (i < lines.length && matchesSection(lines[i], "education")) break;
      }

      experiences.push({
        company: company || "Company",
        role: role.replace(datePattern, "").trim() || "Role",
        period: periodMatch?.[0] || "Period",
        description: achievements[0] || "",
        achievements: achievements.slice(0, 5),
      });
    } else {
      i++;
    }
  }

  if (!experiences.length && lines.length) {
    experiences.push({
      company: lines[0] || "Company",
      role: lines[1] || "Role",
      period: "—",
      description: lines.slice(2).join(" "),
      achievements: parseBulletPoints(lines.slice(2)),
    });
  }

  return experiences;
}

function parseEducationBlock(lines: string[]): Education[] {
  const education: Education[] = [];
  const datePattern = /\d{4}/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (datePattern.test(line) || /b\.?s\.?|m\.?s\.?|b\.?a\.?|ph\.?d|bachelor|master|degree/i.test(line)) {
      education.push({
        institution: lines[i - 1] && !datePattern.test(lines[i - 1]) ? lines[i - 1] : "Institution",
        degree: line,
        period: line.match(/\d{4}\s*[-–—]\s*(?:\d{4}|Present)/i)?.[0] || "",
        details: lines[i + 1] && !datePattern.test(lines[i + 1]) ? lines[i + 1] : undefined,
      });
      i++;
    }
  }

  if (!education.length && lines.length) {
    education.push({
      institution: lines[0],
      degree: lines[1] || "Degree",
      period: lines.find((l) => datePattern.test(l)) || "",
    });
  }

  return education;
}

function parseProjectsBlock(lines: string[]): Project[] {
  const projects: Project[] = [];
  let current: Project | null = null;

  for (const line of lines) {
    const isHeader =
      line.length < 60 &&
      !/^[\s•\-*]/.test(line) &&
      (line === line.toUpperCase() || /^[A-Z]/.test(line));

    if (isHeader && !line.includes(",")) {
      if (current) projects.push(current);
      current = {
        name: line,
        description: "",
        highlights: [],
        technologies: [],
        link: extractUrl(line),
      };
    } else if (current) {
      if (/^[\s•\-*]/.test(line)) {
        current.highlights.push(line.replace(/^[\s•\-*]+\s*/, ""));
      } else if (/technologies?:/i.test(line)) {
        current.technologies = line
          .replace(/technologies?:/i, "")
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        current.description += (current.description ? " " : "") + line;
      }
    }
  }

  if (current) projects.push(current);
  return projects;
}

function extractAvatar(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif)/i);
  return match?.[0];
}

function extractContact(text: string): ContactInfo {
  return {
    email: extractEmail(text),
    phone: extractPhone(text),
    linkedin: extractLinkedIn(text),
    github: extractGitHub(text),
    website: extractUrl(text),
    avatarUrl: extractAvatar(text),
  };
}

export function parseResumeText(rawText: string): ParsedResume {
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\t/g, "  ").trim();
  const sections = splitIntoSections(normalized);

  const name = extractName(sections.header);
  const title = extractTitle(sections.header, sections.about);
  const about = sections.about.join(" ").trim() || undefined;
  const skills = parseSkillsBlock(sections.skills);
  const experience = parseExperienceBlock(sections.experience);
  const education = parseEducationBlock(sections.education);
  const projects = parseProjectsBlock(sections.projects);
  const contact = extractContact(normalized);

  return {
    name,
    title,
    about,
    skills,
    projects,
    experience,
    education,
    contact,
    rawText: normalized,
  };
}

export async function parseResumePdf(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    try { await parser.destroy(); } catch { /* ignore cleanup errors */ }
    if (typeof result === "string") return result;
    if (result && typeof result === "object" && "text" in result) {
      return (result as { text: string }).text;
    }
    return "";
  } catch (err) {
    console.error("PDF parse error:", err);
    throw new Error("Failed to read PDF. Try a text-based PDF or paste the text manually.");
  }
}

export async function parseResumeFromPdf(buffer: Buffer): Promise<ParsedResume> {
  const text = await parseResumePdf(buffer);
  return parseResumeText(text);
}

export async function parseResumeDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseResumeFromDocx(buffer: Buffer): Promise<ParsedResume> {
  const text = await parseResumeDocx(buffer);
  return parseResumeText(text);
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const isPdf =
    mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");

  if (isPdf) return await parseResumePdf(buffer);
  if (isDocx) return await parseResumeDocx(buffer);
  return buffer.toString("utf-8");
}
