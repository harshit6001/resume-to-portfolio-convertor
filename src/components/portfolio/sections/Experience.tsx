"use client";
import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { sectionThemes } from "./theme";
import { InlineEdit } from "../InlineEdit";

interface ExperienceSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  onUpdate?: (path: string, value: unknown) => void;
}

export function ExperienceSection({ data, style, onUpdate }: ExperienceSectionProps) {
  const t = sectionThemes[style];

  if (!data.experience || data.experience.length === 0) return null;

  const f = (idx: number, field: string) => (val: string) =>
    onUpdate?.(`experience.${idx}.${field}`, val);

  return (
    <section className="px-6 py-12 md:px-12">
      <h2 className={`mb-6 text-xl font-semibold tracking-wide uppercase ${t.heading}`}>
        {style === "developer" ? (
          <span className="font-mono text-xs text-[#58a6ff]">
            <span className="text-[#3fb950]">##</span> experience.log
          </span>
        ) : (
          "Experience"
        )}
      </h2>

      {/* 1. Developer / Tech Style */}
      {style === "developer" ? (
        <div className="space-y-4 font-mono text-xs">
          {data.experience.map((e, idx) => (
            <article key={idx} className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 text-[#c9d1d9]">
              <div className="mb-2 flex flex-wrap justify-between gap-2 border-b border-[#30363d]/50 pb-2">
                <p className="text-sm font-semibold text-[#f0f6fc]">
                  <span className="text-[#3fb950]">[</span>
                  <InlineEdit as="span" value={e.period} onChange={f(idx, "period")} className="text-[#f0f6fc]" placeholder="Period" />
                  <span className="text-[#3fb950]">]</span>{" "}
                  <InlineEdit as="span" value={e.role} onChange={f(idx, "role")} className="text-[#58a6ff]" placeholder="Role" />
                  <span className="text-[#8b949e]"> @ </span>
                  <InlineEdit as="span" value={e.company} onChange={f(idx, "company")} className="text-[#a5d6ff]" placeholder="Company" />
                </p>
                {e.location && <span className="text-3xs text-[#8b949e]">{e.location}</span>}
              </div>
              {e.description !== undefined && (
                <InlineEdit
                  as="p"
                  value={e.description || ""}
                  onChange={f(idx, "description")}
                  multiline
                  className="mb-3 text-[#8b949e]"
                  placeholder="Role description…"
                />
              )}
              {e.achievements && e.achievements.length > 0 && (
                <ul className="space-y-1 list-none pl-4">
                  {e.achievements.map((a, aIdx) => (
                    <li key={aIdx} className="text-[#8b949e] before:content-['>'] before:text-[#3fb950] before:mr-2 before:font-bold">
                      <InlineEdit
                        as="span"
                        value={a}
                        onChange={(v) => {
                          const newArr = [...e.achievements];
                          newArr[aIdx] = v;
                          onUpdate?.(`experience.${idx}.achievements`, newArr);
                        }}
                        placeholder="Achievement…"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      ) : style === "creative" ? (
        /* 2. Designer / Creative Style */
        <div className="space-y-6">
          {data.experience.map((e, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div>
                  <InlineEdit as="h3" value={e.role} onChange={f(idx, "role")} className="text-lg font-bold text-white" placeholder="Role" />
                  <InlineEdit as="p" value={e.company} onChange={f(idx, "company")} className="text-sm text-purple-300 font-medium" placeholder="Company" />
                </div>
                <div className="text-right">
                  <InlineEdit as="span" value={e.period} onChange={f(idx, "period")} className="text-xs text-purple-400 font-semibold" placeholder="Period" />
                  {e.location && <p className="text-3xs text-purple-500">{e.location}</p>}
                </div>
              </div>
              {e.description !== undefined && (
                <InlineEdit
                  as="p"
                  value={e.description || ""}
                  onChange={f(idx, "description")}
                  multiline
                  className="text-sm leading-relaxed text-purple-200/70 mb-4"
                  placeholder="Role description…"
                />
              )}
              {e.achievements && e.achievements.length > 0 && (
                <ul className="space-y-2 pl-4">
                  {e.achievements.map((a, aIdx) => (
                    <li key={aIdx} className="relative text-xs text-purple-100/70 pl-2 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-pink-400">
                      <InlineEdit
                        as="span"
                        value={a}
                        onChange={(v) => {
                          const newArr = [...e.achievements];
                          newArr[aIdx] = v;
                          onUpdate?.(`experience.${idx}.achievements`, newArr);
                        }}
                        placeholder="Achievement…"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      ) : (
        /* 3. Student / General Style */
        <div className="relative border-l-2 border-zinc-200 pl-6 space-y-8 ml-2">
          {data.experience.map((e, idx) => (
            <article key={idx} className="relative">
              {/* Node indicator */}
              <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-indigo-600 bg-white" />
              
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
                <div>
                  <InlineEdit as="h3" value={e.role} onChange={f(idx, "role")} className="text-base font-bold text-zinc-900" placeholder="Role" />
                  <InlineEdit as="p" value={e.company} onChange={f(idx, "company")} className="text-sm font-semibold text-indigo-600" placeholder="Company" />
                </div>
                <div className="text-left sm:text-right">
                  <InlineEdit as="span" value={e.period} onChange={f(idx, "period")} className="text-xs font-semibold text-zinc-400" placeholder="Period" />
                  {e.location && <p className="text-3xs text-zinc-400">{e.location}</p>}
                </div>
              </div>
              {e.description !== undefined && (
                <InlineEdit
                  as="p"
                  value={e.description || ""}
                  onChange={f(idx, "description")}
                  multiline
                  className="mb-3 text-sm leading-relaxed text-zinc-600"
                  placeholder="Role description…"
                />
              )}
              {e.achievements && e.achievements.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed text-zinc-600">
                  {e.achievements.map((a, aIdx) => (
                    <li key={aIdx}>
                      <InlineEdit
                        as="span"
                        value={a}
                        onChange={(v) => {
                          const newArr = [...e.achievements];
                          newArr[aIdx] = v;
                          onUpdate?.(`experience.${idx}.achievements`, newArr);
                        }}
                        placeholder="Achievement…"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
