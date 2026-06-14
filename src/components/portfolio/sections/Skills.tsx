import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { sectionThemes } from "./theme";

interface SkillsSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
}

export function SkillsSection({ data, style }: SkillsSectionProps) {
  const t = sectionThemes[style];

  if (!data.skills || data.skills.length === 0) return null;

  return (
    <section className="px-6 py-12 md:px-12">
      <h2 className={`mb-6 text-xl font-semibold tracking-wide uppercase ${t.heading}`}>
        {style === "developer" ? (
          <span className="font-mono text-xs text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> skills.json
          </span>
        ) : (
          "Skills"
        )}
      </h2>

      {/* 1. Developer / Tech Style */}
      {style === "developer" ? (
        <div className="space-y-3 font-mono text-xs">
          {data.skills.map((g) => (
            <div key={g.category} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 text-[var(--text-main)]">
              <p className="mb-2 text-[var(--accent-color)]">
                &quot;{g.category.toLowerCase().replace(/\s+/g, "_")}&quot;: [
              </p>
              <div className="flex flex-wrap gap-2 pl-4">
                {g.items.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-[var(--border-color)] bg-[var(--bg-main)] px-2 py-0.5 text-xs text-[var(--accent-alt)]"
                  >
                    &quot;{s}&quot;
                  </span>
                ))}
              </div>
              <p className="text-[var(--accent-color)]">]</p>
            </div>
          ))}
        </div>
      ) : style === "creative" ? (
        /* 2. Designer / Creative Style */
        <div className="grid gap-4 sm:grid-cols-2">
          {data.skills.map((g) => (
            <div key={g.category} className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 backdrop-blur-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--accent-hover)]">
                {g.category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[var(--accent-bg)] hover:bg-[var(--accent-bg)]/85 border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--text-main)] shadow-sm transition-all"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 3. Student / General Style */
        <div className="space-y-4">
          {data.skills.map((g) => (
            <div key={g.category} className="border-b border-[var(--border-color)] pb-4 last:border-0 last:pb-0">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {g.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <span key={s} className="rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1 text-xs text-[var(--text-main)] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
