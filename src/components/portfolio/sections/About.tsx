"use client";
import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { sectionThemes } from "./theme";
import { InlineEdit } from "../InlineEdit";

interface AboutSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  onUpdate?: (path: string, value: unknown) => void;
}

export function AboutSection({ data, style, onUpdate }: AboutSectionProps) {
  const t = sectionThemes[style];

  return (
    <section className="px-6 py-12 md:px-12">
      <h2 className={`mb-6 text-xl font-semibold tracking-wide uppercase ${t.heading}`}>
        {style === "developer" ? (
          <span className="font-mono text-xs text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> biography.md
          </span>
        ) : (
          "About Me"
        )}
      </h2>

      {/* 1. Developer biography accent */}
      {style === "developer" ? (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 font-mono text-sm leading-relaxed text-[var(--text-muted)]">
          <div className="mb-3 border-b border-[var(--border-color)]/50 pb-2 text-3xs text-[var(--text-muted)]/50 flex gap-2">
            <span>File: biography.md</span>
            <span>Size: {data.about?.length || 0} bytes</span>
          </div>
          <InlineEdit
            as="p"
            value={data.about || ""}
            onChange={(v) => onUpdate?.("about", v)}
            multiline
            className="text-[var(--text-main)]"
            placeholder="Write your bio here…"
          />
        </div>
      ) : style === "creative" ? (
        /* 2. Creative biography accent */
        <div className="relative rounded-2xl p-6 text-base leading-relaxed border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-sm">
          <div className="absolute -left-2 top-2 text-4xl text-[var(--accent-color)]/25 font-serif font-bold">&ldquo;</div>
          <InlineEdit
            as="p"
            value={data.about || ""}
            onChange={(v) => onUpdate?.("about", v)}
            multiline
            className="pl-4 text-[var(--text-main)]/90 italic"
            placeholder="Write your bio here…"
          />
          <div className="absolute -right-2 bottom-2 text-4xl text-[var(--accent-color)]/25 font-serif font-bold">&rdquo;</div>
        </div>
      ) : (
        /* 3. Student / General biography accent */
        <div className="border-l-4 border-[var(--accent-color)] pl-4 py-1 text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
          <InlineEdit
            as="p"
            value={data.about || ""}
            onChange={(v) => onUpdate?.("about", v)}
            multiline
            placeholder="Write your bio here…"
          />
        </div>
      )}
    </section>
  );
}
