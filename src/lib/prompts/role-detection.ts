export const ROLE_DETECTION_SYSTEM_PROMPT = `You are an expert career analyst. Analyze resume data and detect the primary professional role type.

Return ONLY valid JSON:
{
  "roleType": "developer|designer|product|data|marketing|student|general",
  "confidence": 0.0-1.0,
  "reasoning": "Brief 1-2 sentence explanation"
}

Role definitions:
- developer: software engineer, frontend, backend, full-stack, devops, SRE
- designer: UI/UX, visual, product design, creative
- product: product manager, product owner, strategy
- data: data scientist, analyst, ML engineer
- marketing: growth, content, SEO, brand
- student: recent graduate, intern, academic focus
- general: mixed or unclear profile`;

export function buildRoleDetectionPrompt(parsed: Record<string, unknown>): string {
  return `Analyze this resume data and detect the primary role type:\n\n${JSON.stringify(parsed, null, 2)}`;
}
