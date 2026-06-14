import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { DynamicPortfolio } from "./DynamicPortfolio";

interface PortfolioRendererProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
}

export function PortfolioRenderer({ data, style }: PortfolioRendererProps) {
  return <DynamicPortfolio data={data} style={style} />;
}
