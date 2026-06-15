/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { ExternalLink, FolderGit2, Sparkles, Search, Camera, Upload } from "lucide-react";
import { sectionThemes } from "./theme";

interface ProjectsSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  onUpdate?: (path: string, value: unknown) => void;
}

export function ProjectsSection({ data, style, onUpdate }: ProjectsSectionProps) {
  const t = sectionThemes[style];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  if (!data.projects || data.projects.length === 0) return null;

  // Extract top categories from technologies
  const allTechs = Array.from(
    new Set(data.projects.flatMap((p) => p.technologies || []))
  ).filter(Boolean);
  const categories = ["All", ...allTechs.slice(0, 5)];

  const filteredProjects = data.projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      activeFilter === "All" ||
      p.technologies.some((t) => t.toLowerCase() === activeFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <section className="px-6 py-12 md:px-12">
      <h2 className={`mb-6 text-xl font-semibold tracking-wide uppercase ${t.heading}`}>
        {style === "developer" ? (
          <span className="font-mono text-xs text-[var(--accent-color)]">
            <span className="text-[var(--accent-alt)]">##</span> projects/
          </span>
        ) : (
          "Featured Projects"
        )}
      </h2>

      {/* Search & Filter Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          {style === "developer" ? (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 text-xs text-[var(--text-muted)] font-mono">
              <span className="text-[var(--accent-alt)]">$</span>
              <span>grep -i</span>
              <input
                type="text"
                placeholder='"keyword"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[var(--text-main)] focus:outline-none flex-1 font-mono placeholder-[var(--text-muted)]/50 border-0 p-0 text-xs"
              />
            </div>
          ) : style === "creative" ? (
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-purple-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-4 py-1.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent-color)] transition-all"
              />
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-4 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent-color)] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map((cat) => {
            const isActive = activeFilter.toLowerCase() === cat.toLowerCase();
            if (style === "developer") {
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`rounded border px-2 py-0.5 text-[10px] font-mono tracking-wider transition-colors cursor-pointer ${isActive
                      ? "border-[var(--accent-alt)] bg-[var(--accent-bg)] text-[var(--accent-alt)]"
                      : "border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:border-[var(--text-main)]"
                    }`}
                >
                  [{cat.toLowerCase().replace(/\s+/g, "_")}]
                </button>
              );
            } else if (style === "creative") {
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "border border-[var(--border-color)] bg-[var(--accent-bg)] text-[var(--accent-color)] hover:bg-[var(--accent-bg)]/80"
                    }`}
                >
                  {cat}
                </button>
              );
            } else {
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-wide transition-colors cursor-pointer ${isActive
                      ? "bg-[var(--accent-color)] text-[var(--bg-main)]"
                      : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-[var(--accent-bg)] border border-[var(--border-color)]"
                    }`}
                >
                  {cat}
                </button>
              );
            }
          })}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className={`p-8 text-center text-xs rounded-xl ${style === "developer"
            ? "border border-[var(--border-color)] bg-[var(--card-bg)] font-mono text-[var(--text-muted)]"
            : style === "creative"
              ? "border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)]"
              : "border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)]"
          }`}>
          No projects found matching current filter or search criteria.
        </div>
      ) : (
        /* Render projects */
        style === "developer" ? (
          <div className="space-y-4 font-mono text-xs">
            {filteredProjects.map((p, idx) => (
              <article key={idx} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 text-[var(--text-main)] hover-lift">
                <div className="mb-2 flex items-center justify-between border-b border-[var(--border-color)]/50 pb-2">
                  <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                    <FolderGit2 className="h-4 w-4 text-[var(--accent-alt)]" />
                    ./{p.name.toLowerCase().replace(/\s+/g, "-")}
                  </h3>
                  <span className="text-3xs text-[var(--text-muted)]">{p.period || "Active"}</span>
                </div>
                <p className="mb-3 text-sm text-[var(--text-muted)] leading-relaxed">{p.description}</p>
                {p.highlights && p.highlights.length > 0 && (
                  <ul className="mb-4 pl-4 space-y-1 list-none">
                    {p.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="text-[var(--text-muted)] before:content-['+'] before:text-[var(--accent-alt)] before:mr-2 before:font-bold">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.technologies.map((t) => (
                    <span key={t} className="text-3xs text-[var(--accent-alt)] font-bold">
                      #{t.toLowerCase().replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--accent-color)] hover:underline"
                  >
                    view_repository() <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : style === "creative" ? (
          /* 2. Designer / Creative Style */
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredProjects.map((p, idx) => {
              const imgUrl = p.imageUrl || `/project${(idx % 3) + 1}.png`;
              return (
                <article
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-color)]/45 hover:shadow-[0_0_20px_rgba(167,139,250,0.1)]"
                >
                  {/* Visual Project Mockup Header */}
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-950/80 group/img">
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                    
                    {onUpdate && (
                      <div className="absolute inset-0 bg-black/65 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <label className="flex items-center justify-center p-2 rounded-full bg-zinc-900/90 text-white border border-zinc-700 hover:bg-zinc-800 hover:scale-105 transition-all cursor-pointer" title="Upload custom project image">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === "string") {
                                  onUpdate(`projects.${idx}.imageUrl`, reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const promptStr = window.prompt("Enter prompt to generate project image (e.g. 'minimalist logo, startup style'):");
                            if (promptStr) {
                              const encoded = encodeURIComponent(promptStr.trim());
                              const genUrl = `https://image.pollinations.ai/prompt/${encoded}?width=600&height=400&nologo=true&private=true`;
                              onUpdate(`projects.${idx}.imageUrl`, genUrl);
                            }
                          }}
                          className="p-2 rounded-full bg-indigo-900/90 text-indigo-300 border border-indigo-700 hover:bg-indigo-850 hover:text-white hover:scale-105 transition-all"
                          title="AI Generate Project Image"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Creative top-bar gradient underline */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--accent-color)] transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-3xs text-[var(--accent-color)] font-semibold uppercase">{p.period}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--text-muted)] mb-4">{p.description}</p>

                    {p.highlights && p.highlights.length > 0 && (
                      <ul className="mb-4 space-y-1.5">
                        {p.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex gap-2 text-3xs text-[var(--text-muted)]">
                            <Sparkles className="h-3 w-3 text-pink-400 shrink-0 mt-0.5" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.technologies.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--accent-bg)] border border-[var(--border-color)] px-2.5 py-0.5 text-3xs font-medium text-[var(--accent-color)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-color)] hover:text-white hover:underline transition-colors"
                      >
                        Launch Project <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* 3. Student / General Style */
          <div className="space-y-6">
            {filteredProjects.map((p, idx) => {
              const imgUrl = p.imageUrl || `/project${(idx % 3) + 1}.png`;
              return (
                <article key={idx} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-sm hover-lift">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 h-48 md:h-32 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] shrink-0 relative group/img">
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-350 group-hover/img:scale-105"
                      />
                      {onUpdate && (
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                          <label className="flex items-center justify-center p-2 rounded-full bg-zinc-900/90 text-white border border-zinc-700 hover:bg-zinc-800 hover:scale-105 transition-all cursor-pointer" title="Upload custom project image">
                            <Camera className="h-3.5 w-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === "string") {
                                    onUpdate(`projects.${idx}.imageUrl`, reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const promptStr = window.prompt("Enter prompt to generate project image (e.g. 'minimalist logo, startup style'):");
                              if (promptStr) {
                                const encoded = encodeURIComponent(promptStr.trim());
                                const genUrl = `https://image.pollinations.ai/prompt/${encoded}?width=600&height=400&nologo=true&private=true`;
                                onUpdate(`projects.${idx}.imageUrl`, genUrl);
                              }
                            }}
                            className="p-2 rounded-full bg-indigo-900/90 text-indigo-300 border border-indigo-700 hover:bg-indigo-850 hover:text-white hover:scale-105 transition-all"
                            title="AI Generate Project Image"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <div className="mb-1.5 flex items-baseline justify-between gap-4">
                          <h3 className="text-base font-bold text-[var(--text-main)]">{p.name}</h3>
                          {p.period && <span className="text-xs text-[var(--text-muted)]">{p.period}</span>}
                        </div>
                        <p className="mb-3 text-xs leading-relaxed text-[var(--text-muted)]">{p.description}</p>

                        {p.highlights && p.highlights.length > 0 && (
                          <ul className="mb-3 pl-5 list-disc space-y-1 text-3xs text-[var(--text-muted)]">
                            {p.highlights.map((h, hIdx) => (
                              <li key={hIdx}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]/40">
                        <div className="flex flex-wrap gap-1">
                          {p.technologies.map((t) => (
                            <span key={t} className="rounded bg-[var(--accent-bg)] border border-[var(--border-color)] px-2 py-0.5 text-3xs font-semibold text-[var(--accent-color)]">
                              {t}
                            </span>
                          ))}
                        </div>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-color)] hover:underline"
                          >
                            View Project <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      )}
    </section>
  );
}
