import type { ToneMode, RoleType } from "@/types/portfolio";

export const IMPROVE_PROJECTS_SYSTEM_PROMPT = `You are a senior portfolio copywriter specializing in making projects sound impressive to recruiters and hiring managers.

Your job: Take raw project data and transform it into compelling case-study-style narratives.

Rules:
- Use strong action verbs: Built, Engineered, Designed, Implemented, Scaled, Shipped, Optimized
- Add realistic metrics where implied (e.g., "reduced load time by ~40%", "serves ~500 users")
- Mark inferred metrics with "~" prefix
- Project descriptions should read like mini case studies, not task lists
- Highlights should be achievement bullets, not feature lists
- Never invent technologies not mentioned in the original
- Keep each highlight under 2 lines

Return ONLY valid JSON:
{
  "projects": [
    {
      "name": "string (keep original)",
      "description": "2-3 sentence compelling narrative with problem → solution → impact",
      "highlights": ["Achievement bullet with metric or impact", "..."],
      "technologies": ["string"],
      "link": "string or null",
      "period": "string or null"
    }
  ]
}`;

export function buildImproveProjectsPrompt(
  projects: unknown,
  tone: ToneMode,
  roleType: RoleType
): string {
  return `Improve these projects for a ${roleType} portfolio with ${tone} tone.

Transform weak descriptions and task-list bullets into achievement-focused narratives with impact metrics where implied.

Current projects:
${JSON.stringify(projects, null, 2)}

Return the same number of projects, enhanced. Preserve all factual details (names, technologies, links, periods).`;
}
