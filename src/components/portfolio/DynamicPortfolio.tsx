import type { EnhancedPortfolio, PortfolioStyle, EditableSection, AccentColor } from "@/types/portfolio";
import { sectionThemes } from "./sections/theme";
import { HeroSection } from "./sections/Hero";
import { AboutSection } from "./sections/About";
import { MetricsSection } from "./sections/Metrics";
import { SkillsSection } from "./sections/Skills";
import { ProjectsSection } from "./sections/Projects";
import { ExperienceSection } from "./sections/Experience";
import { EducationSection } from "./sections/Education";
import { ContactSection } from "./sections/Contact";

interface EditableSectionWrapperProps {
  section: EditableSection;
  children: React.ReactNode;
}

function EditableSectionWrapper({ section, children }: EditableSectionWrapperProps) {
  const handleEditClick = () => {
    const el = document.getElementById(`editor-section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-indigo-500", "transition-all", "duration-500");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-indigo-500");
      }, 2000);
    }
  };

  return (
    <div className="group relative border border-transparent hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all duration-200 rounded-xl">
      <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleEditClick}
          className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all hover:scale-105"
        >
          <Pencil className="h-3 w-3" />
          Edit in panel
        </button>
      </div>
      {children}
    </div>
  );
}

import { usePortfolioStore } from "@/store/portfolio-store";
import { getThemeVariables } from "@/lib/export";
import { AIChatWidget } from "./sections/AIChatWidget";
import { Pencil, Sun, Moon } from "lucide-react";

interface DynamicPortfolioProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  accentColor?: AccentColor | null;
  /** Optional: called when user edits inline in the preview */
  onUpdate?: (path: string, value: unknown) => void;
}

export function DynamicPortfolio({ data, style, onUpdate }: DynamicPortfolioProps) {
  const t = sectionThemes[style];

  const { accentColor, isDark, setAccentColor, setIsDark } = usePortfolioStore();

  const finalAccentColor = accentColor || (style === "developer" ? "emerald" : style === "minimal" ? "amber" : "violet");
  const finalIsDark = isDark !== null ? isDark : style !== "minimal";

  const vars = getThemeVariables(style, accentColor, finalIsDark);

  return (
    <div
      key={style}
      id="portfolio-preview-root"
      style={{
        backgroundColor: vars.bgMain,
        backgroundImage: finalIsDark && finalAccentColor === "violet" ? "linear-gradient(to bottom right, #0f0f1a, #1a1033, #0d1f2d)" : undefined,
        color: vars.textMain,
        fontFamily: style === "developer" ? "var(--font-geist-mono)" : "var(--font-geist-sans)",
        "--bg-main": vars.bgMain,
        "--text-main": vars.textMain,
        "--text-muted": vars.textMuted,
        "--border-color": vars.borderColor,
        "--card-bg": vars.cardBg,
        "--accent-color": vars.accentColor,
        "--accent-bg": vars.accentBg,
        "--accent-hover": vars.accentHover,
      } as React.CSSProperties}
      className="relative min-h-full transition-colors duration-300"
    >
      {/* Floating Theme / Mode Selector */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-full border border-zinc-200/15 bg-zinc-950/80 p-1.5 backdrop-blur-md text-xs shadow-lg text-white">
        <button
          onClick={() => setIsDark(!finalIsDark)}
          className="rounded-full p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {finalIsDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-400" />}
        </button>
        <div className="h-3.5 w-px bg-zinc-800" />
        <button
          onClick={() => setAccentColor("violet")}
          className={`h-3 w-3 rounded-full bg-violet-500 transition-all cursor-pointer ${finalAccentColor === "violet" ? "ring-2 ring-white scale-110" : "opacity-50"}`}
          title="Violet Theme"
        />
        <button
          onClick={() => setAccentColor("emerald")}
          className={`h-3 w-3 rounded-full bg-emerald-500 transition-all cursor-pointer ${finalAccentColor === "emerald" ? "ring-2 ring-white scale-110" : "opacity-50"}`}
          title="Emerald Theme"
        />
        <button
          onClick={() => setAccentColor("amber")}
          className={`h-3 w-3 rounded-full bg-amber-500 transition-all cursor-pointer ${finalAccentColor === "amber" ? "ring-2 ring-white scale-110" : "opacity-50"}`}
          title="Amber Theme"
        />
      </div>

      <HeroSection data={data} style={style} onUpdate={onUpdate} />
      <main className="mx-auto max-w-3xl">
        <EditableSectionWrapper section="about">
          <AboutSection data={data} style={style} onUpdate={onUpdate} />
        </EditableSectionWrapper>
        {!data.uiOverrides?.hideMetrics && (
          <MetricsSection data={data} style={style} />
        )}
        <EditableSectionWrapper section="skills">
          <SkillsSection data={data} style={style} />
        </EditableSectionWrapper>
        <EditableSectionWrapper section="projects">
          <ProjectsSection data={data} style={style} onUpdate={onUpdate} />
        </EditableSectionWrapper>
        <EditableSectionWrapper section="experience">
          <ExperienceSection data={data} style={style} onUpdate={onUpdate} />
        </EditableSectionWrapper>
        <EditableSectionWrapper section="education">
          <EducationSection data={data} style={style} />
        </EditableSectionWrapper>
        <EditableSectionWrapper section="contact">
          <ContactSection data={data} style={style} />
        </EditableSectionWrapper>
      </main>
      <footer className={`border-t px-6 py-6 text-center text-xs ${t.border} ${t.muted}`}>
        © {new Date().getFullYear()} {data.name}
      </footer>

      {/* Interactive AI Chat Twin */}
      <AIChatWidget data={data} style={style} />
    </div>
  );
}
