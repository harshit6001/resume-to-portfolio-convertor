import type { EnhancedPortfolio, PortfolioStyle, AccentColor } from "@/types/portfolio";
import { DynamicPortfolio } from "./DynamicPortfolio";

interface PortfolioRendererProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  accentColor?: AccentColor | null;
  onUpdate?: (path: string, value: unknown) => void;
}

export function PortfolioRenderer({ data, style, accentColor, onUpdate }: PortfolioRendererProps) {
  return <DynamicPortfolio data={data} style={style} accentColor={accentColor} onUpdate={onUpdate} />;
}
