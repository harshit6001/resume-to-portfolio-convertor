/** @deprecated Use @/lib/ai/pipeline instead */
export {
  parseResumeWithAI as aiParseResume,
  enhanceContent,
  runPortfolioPipeline,
  regenerateSection,
  adjustTone,
  detectRole,
  analyzeContentGaps,
  generateAbout,
  analyzeGaps,
  improveProjects,
} from "./ai/pipeline";
export { isAIEnabled } from "./ai/client";

import type { EnhancedPortfolio, ParsedResume, PortfolioStyle } from "@/types/portfolio";
import { enhanceContent, detectRole } from "./ai/pipeline";

/** @deprecated Use runPortfolioPipeline */
export async function enhancePortfolio(
  parsed: ParsedResume,
  style: PortfolioStyle
): Promise<EnhancedPortfolio> {
  const roleResult = await detectRole(parsed);
  const enhanced = await enhanceContent(parsed, style, "professional", roleResult.roleType);
  return enhanced as EnhancedPortfolio;
}
