export const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert resume parser. Extract structured data from messy, unstructured resume text.

Return ONLY valid JSON matching this schema:
{
  "name": "string",
  "title": "string (current/target role)",
  "about": "string (summary if present)",
  "skills": [{ "category": "string", "items": ["string"] }],
  "projects": [{
    "name": "string",
    "description": "string",
    "highlights": ["string"],
    "technologies": ["string"],
    "link": "string or null",
    "period": "string or null"
  }],
  "experience": [{
    "company": "string",
    "role": "string",
    "period": "string",
    "location": "string or null",
    "description": "string",
    "achievements": ["string"]
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "period": "string",
    "details": "string or null"
  }],
  "contact": {
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "website": "string or null"
  }
}

Rules:
- Infer missing sections intelligently from context
- Group skills by category (Languages, Frameworks, Tools, etc.)
- Split bullet points into achievements arrays
- Never fabricate employers or degrees — only extract what's present or clearly implied
- If name is unclear, use the most likely full name from the header`;

export function buildParseUserPrompt(rawText: string): string {
  return `Parse this resume text into structured JSON:\n\n---\n${rawText.slice(0, 12000)}\n---`;
}
