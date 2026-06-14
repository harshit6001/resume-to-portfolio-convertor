import type { PortfolioStyle } from "@/types/portfolio";

export interface SectionTheme {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  accentAlt: string;
  border: string;
  card: string;
  tag: string;
  heading: string;
  font: string;
  mono: string;
}

export const sectionThemes: Record<PortfolioStyle, SectionTheme> = {
  minimal: {
    bg: "bg-[var(--bg-main)]",
    text: "text-[var(--text-main)]",
    muted: "text-[var(--text-muted)]",
    accent: "text-[var(--accent-color)]",
    accentAlt: "text-[var(--accent-hover)]",
    border: "border-[var(--border-color)]",
    card: "bg-[var(--card-bg)] border border-[var(--border-color)]",
    tag: "bg-[var(--accent-bg)] text-[var(--accent-color)] border border-[var(--border-color)]",
    heading: "text-[var(--text-main)] border-b border-[var(--accent-color)]",
    font: "font-sans",
    mono: "font-sans",
  },
  creative: {
    bg: "bg-[var(--bg-main)]",
    text: "text-[var(--text-main)]",
    muted: "text-[var(--text-muted)]",
    accent: "text-[var(--accent-color)]",
    accentAlt: "text-[var(--accent-hover)]",
    border: "border-[var(--border-color)]",
    card: "bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-sm",
    tag: "bg-[var(--accent-bg)] text-[var(--accent-color)] border border-[var(--border-color)]",
    heading: "text-[var(--text-main)]",
    font: "font-sans",
    mono: "font-sans",
  },
  developer: {
    bg: "bg-[var(--bg-main)]",
    text: "text-[var(--text-main)]",
    muted: "text-[var(--text-muted)]",
    accent: "text-[var(--accent-color)]",
    accentAlt: "text-[var(--accent-hover)]",
    border: "border-[var(--border-color)]",
    card: "bg-[var(--card-bg)] border border-[var(--border-color)]",
    tag: "bg-[var(--card-bg)] text-[var(--accent-color)] border border-[var(--border-color)] font-mono text-xs",
    heading: "text-[var(--accent-color)] font-mono",
    font: "font-sans",
    mono: "font-mono",
  },
};

export function shouldShowSection(
  section: "projects" | "experience" | "education" | "skills",
  data: {
    projects: unknown[];
    experience: unknown[];
    education: unknown[];
    skills: unknown[];
  }
): boolean {
  switch (section) {
    case "projects":
      return data.projects.length > 0;
    case "experience":
      return data.experience.length > 0;
    case "education":
      return data.education.length > 0;
    case "skills":
      return data.skills.length > 0;
    default:
      return true;
  }
}
