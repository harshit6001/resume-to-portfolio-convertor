import type { EnhancedPortfolio, PortfolioStyle, AccentColor } from "@/types/portfolio";
import { DynamicPortfolio } from "./DynamicPortfolio";

interface PortfolioRendererProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  accentColor?: AccentColor | null;
}

export function PortfolioRenderer({ data, style, accentColor }: PortfolioRendererProps) {
  return <DynamicPortfolio data={data} style={style} accentColor={accentColor} />;
}
