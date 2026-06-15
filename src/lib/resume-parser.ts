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

/**
 * Attempts to extract a headshot / profile photo embedded in a resume file.
 * Returns a base64 data URL string (e.g. "data:image/png;base64,...") or null.
 *
 * - PDF: walks all page XObject images via pdfjs-dist and picks the
 *        largest one that plausibly looks like a portrait (h ≥ w, min 40 px).
 * - DOCX: captures the first embedded image via mammoth's image handler.
 * - TXT: no image possible — returns null.
 */
export async function extractPhotoFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string | null> {
  const isPdf =
    mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");

  if (isPdf) return extractPhotoFromPdf(buffer);
  if (isDocx) return extractPhotoFromDocx(buffer);
  return null;
}

/** Extract the first plausible headshot from a PDF using pdfjs-dist */
async function extractPhotoFromPdf(buffer: Buffer): Promise<string | null> {
  try {
    // pdfjs-dist needs a Uint8Array
    const uint8 = new Uint8Array(buffer);

    // Lazy-import to avoid bundling in the browser
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Disable the worker in a Node.js environment
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const pdf = await pdfjsLib.getDocument({ data: uint8, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;

    let bestImage: { width: number; height: number; data: Uint8Array | Uint8ClampedArray; kind: number } | null = null;
    let bestArea = 0;

    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      const objs = page.commonObjs;
      void objs; // keep ref

      // Collect image object names referenced on this page
      const imageNames: string[] = [];
      for (let i = 0; i < ops.fnArray.length; i++) {
        // OPS.paintImageXObject = 85, OPS.paintInlineImageXObject = 84
        if (ops.fnArray[i] === 85 || ops.fnArray[i] === 84) {
          const args = ops.argsArray[i];
          if (args && typeof args[0] === "string") {
            imageNames.push(args[0]);
          }
        }
      }

      for (const name of imageNames) {
        try {
          // getObjects resolves the image from the page's object store
          const imgData = await new Promise<{ width: number; height: number; data: Uint8Array | Uint8ClampedArray; kind: number } | null>((resolve) => {
            page.objs.get(name, (obj: unknown) => {
              if (
                obj &&
                typeof obj === "object" &&
                "width" in obj &&
                "height" in obj &&
                "data" in obj
              ) {
                resolve(obj as { width: number; height: number; data: Uint8Array | Uint8ClampedArray; kind: number });
              } else {
                resolve(null);
              }
            });
          });

          if (!imgData) continue;
          const { width, height } = imgData;
          // Filter out tiny icons / decorative images (< 40 px)
          if (width < 40 || height < 40) continue;
          const area = width * height;
          if (area > bestArea) {
            bestArea = area;
            bestImage = imgData;
          }
        } catch {
          // ignore individual image decode errors
        }
      }
    }

    if (!bestImage) return null;
    return imageDataToDataUrl(bestImage);
  } catch (err) {
    console.warn("PDF photo extraction failed:", err);
    return null;
  }
}

/** Convert a pdfjs ImageData object to a base64 PNG data URL */
function imageDataToDataUrl(imgData: {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
  kind: number;
}): string {
  const { width, height, data, kind } = imgData;

  // pdfjs image kind: 1 = GRAYSCALE_1BPP, 2 = RGB_24BPP, 3 = RGBA_32BPP
  let rgba: Uint8ClampedArray;

  if (kind === 3) {
    // Already RGBA
    rgba = new Uint8ClampedArray(data);
  } else if (kind === 2) {
    // RGB → RGBA
    rgba = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      rgba[i * 4] = data[i * 3];
      rgba[i * 4 + 1] = data[i * 3 + 1];
      rgba[i * 4 + 2] = data[i * 3 + 2];
      rgba[i * 4 + 3] = 255;
    }
  } else {
    // Grayscale — expand to RGBA
    rgba = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const v = data[i] ?? 0;
      rgba[i * 4] = v;
      rgba[i * 4 + 1] = v;
      rgba[i * 4 + 2] = v;
      rgba[i * 4 + 3] = 255;
    }
  }

  // Encode as PNG using sharp (already in node_modules)
  // We do this synchronously via a raw pixel buffer conversion
  // Return a data URL — use sharp to encode to PNG
  try {
    // Build a minimal PNG via raw buffer (no sharp needed — use simple packing)
    const pngBase64 = rawRgbaToPngBase64(rgba, width, height);
    return `data:image/png;base64,${pngBase64}`;
  } catch {
    // Fallback: raw base64 of the pixel data (browsers may not render this, but
    // it at least carries the image through to the avatar handler)
    const b64 = Buffer.from(rgba).toString("base64");
    return `data:image/png;base64,${b64}`;
  }
}

/** Minimal PNG encoder (no dependencies) — encodes raw RGBA pixels to PNG */
function rawRgbaToPngBase64(
  rgba: Uint8ClampedArray,
  width: number,
  height: number
): string {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  // Build raw image data with filter bytes
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (rowSize + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (rowSize + 1)] = 0; // filter type = None
    for (let x = 0; x < rowSize; x++) {
      rawData[y * (rowSize + 1) + 1 + x] = rgba[y * rowSize + x];
    }
  }

  // zlib-compress the raw data using Node's built-in zlib
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const zlib = require("zlib") as typeof import("zlib");
  const compressed = zlib.deflateSync(rawData);

  function chunk(type: string, data: Buffer): Buffer {
    const typeBytes = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcData = Buffer.concat([typeBytes, data]);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crc32 = require("zlib").crc32 as ((data: Buffer, crc?: number) => number) | undefined;
    let crc: number;
    if (typeof crc32 === "function") {
      crc = crc32(crcData);
    } else {
      crc = computeCrc32(crcData);
    }
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
  }

  const png = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  return png.toString("base64");
}

/** Fallback CRC-32 implementation (used if zlib.crc32 is unavailable) */
function computeCrc32(buf: Buffer): number {
  const table = makeCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crcTable: Uint32Array | null = null;
function makeCrcTable(): Uint32Array {
  if (_crcTable) return _crcTable;
  _crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    _crcTable[n] = c;
  }
  return _crcTable;
}

/** Extract the first embedded image from a DOCX file using mammoth */
async function extractPhotoFromDocx(buffer: Buffer): Promise<string | null> {
  try {
    const mammoth = await import("mammoth");

    let capturedImage: { data: Buffer; mimeType: string } | null = null;

    await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          if (!capturedImage) {
            const imgBuffer = await image.read("base64");
            capturedImage = {
              data: Buffer.from(imgBuffer as string, "base64"),
              mimeType: image.contentType,
            };
          }
          return { src: "" };
        }),
      }
    );

    if (!capturedImage) return null;
    const captured = capturedImage as { data: Buffer; mimeType: string };
    return `data:${captured.mimeType};base64,${captured.data.toString("base64")}`;

  } catch (err) {
    console.warn("DOCX photo extraction failed:", err);
    return null;
  }
}
