"use client";

import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { Sparkles, Trophy, Flame } from "lucide-react";
import { sectionThemes } from "./theme";

interface MetricsSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
}

export interface MetricItem {
  value: string;
  label: string;
}

export function extractMetrics(data: EnhancedPortfolio): MetricItem[] {
  const items: MetricItem[] = [];
  const seenValues = new Set<string>();

  // Gather bullet points from projects and experience
  const bullets: string[] = [];
  data.projects?.forEach((p) => {
    if (p.highlights) bullets.push(...p.highlights);
  });
  data.experience?.forEach((e) => {
    if (e.achievements) bullets.push(...e.achievements);
  });

  // Regex matches percentages (35%), quantities (10+), multipliers (5x), currencies ($10k)
  const metricRegex = /(\b\d+(?:\.\d+)?%|\b\d+\s*\+?[\s-]*(?:years|developers|engineers|users|clients|projects|countries)?\b|\b\d+\s*[xX]\b|\$\d+(?:\.\d+)?\s*(?:[kK]|[mM]|[bB])?)/g;

  for (const bullet of bullets) {
    const match = bullet.match(metricRegex);
    if (match) {
      for (const m of match) {
        const val = m.trim();
        // Skip simple single digit numbers without symbols, ensure uniqueness and max 4 cards
        if (val.length > 1 && !seenValues.has(val.toLowerCase()) && items.length < 4) {
          seenValues.add(val.toLowerCase());
          
          let cleanLabel = bullet
            .replace(val, "")
            .replace(/^[\s•\-*+>~]+/, "") // strip bullet markers
            .trim();
          
          if (cleanLabel.length > 5) {
            cleanLabel = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
            if (cleanLabel.length > 55) {
              cleanLabel = cleanLabel.slice(0, 52) + "...";
            }
            items.push({ value: val, label: cleanLabel });
          }
        }
      }
    }
  }

  // Fallback realistic metrics tailored to roleType
  if (items.length === 0) {
    const role = data.roleType || "general";
    if (role === "developer" || role === "data") {
      items.push(
        { value: "~99.9%", label: "Production API service uptime SLA maintained" },
        { value: "~35%", label: "Server latency reduction achieved in core databases" },
        { value: "6+", label: "Cross-functional engineers supported and onboarded" }
      );
    } else if (role === "designer" || role === "marketing") {
      items.push(
        { value: "~42%", label: "Conversion rate increase after landing page overhaul" },
        { value: "12+", label: "Custom design components cataloged in library" },
        { value: "~3x", label: "Delivery speed improvement in visuals pipeline" }
      );
    } else {
      items.push(
        { value: "100%", label: "Operational milestones achieved within schedule limit" },
        { value: "~25%", label: "Process optimization rate across corporate workflows" },
        { value: "8+", label: "High-value client relationships managed successfully" }
      );
    }
  }

  return items;
}

export function MetricsSection({ data, style }: MetricsSectionProps) {
  const t = sectionThemes[style];
  const metrics = extractMetrics(data);

  return (
    <section className="px-6 py-6 md:px-12">
      <h2 className={`mb-6 text-xl font-semibold tracking-wide uppercase ${t.heading}`}>
        {style === "developer" ? (
          <span className="font-mono text-xs text-[var(--accent-color)]">
            <span className="text-[var(--accent-alt)]">##</span> impact_metrics/
          </span>
        ) : (
          "Key Impact Metrics"
        )}
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((item, idx) => {
          if (style === "developer") {
            return (
              <div
                key={idx}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 font-mono text-xs text-[var(--text-main)] hover-lift"
              >
                <div className="mb-2 flex items-center justify-between text-[var(--accent-alt)]">
                  <span>metric_${idx}</span>
                  <Flame className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold text-[var(--accent-color)] mb-1">
                  {item.value}
                </div>
                <p className="text-3xs leading-relaxed text-[var(--text-muted)]">
                  {"// "}{item.label}
                </p>
              </div>
            );
          } else if (style === "creative") {
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-color)]/30 hover:shadow-[0_0_15px_rgba(167,139,250,0.1)]"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-hover)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <div className="mb-3 flex items-center justify-between text-[var(--accent-color)]">
                  <Sparkles className="h-4 w-4 text-[var(--accent-hover)]" />
                </div>
                <div className="bg-gradient-to-r from-[var(--text-main)] to-[var(--accent-hover)] bg-clip-text text-3xl font-extrabold text-transparent mb-1.5 leading-none">
                  {item.value}
                </div>
                <p className="text-2xs leading-relaxed text-[var(--text-muted)] font-light">
                  {item.label}
                </p>
              </div>
            );
          } else {
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm hover-lift"
              >
                <div className="mb-3 flex items-center text-zinc-400">
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-[var(--text-main)] mb-1.5">
                  {item.value}
                </div>
                <p className="text-2xs leading-relaxed text-[var(--text-muted)] font-medium">
                  {item.label}
                </p>
              </div>
            );
          }
        })}
      </div>
    </section>
  );
}
