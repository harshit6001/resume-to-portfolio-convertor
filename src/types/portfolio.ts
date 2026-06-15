export type PortfolioStyle = "minimal" | "creative" | "developer";

export type ToneMode = "professional" | "creative" | "startup";

export type RoleType =
  | "developer"
  | "designer"
  | "product"
  | "data"
  | "marketing"
  | "student"
  | "general";

export type EditableSection =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "contact";

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  avatarUrl?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Project {
  name: string;
  description: string;
  highlights: string[];
  technologies: string[];
  link?: string;
  period?: string;
  imageUrl?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location?: string;
  description: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  details?: string;
}

/** Original parsed resume — never overwritten by AI */
export interface ParsedResume {
  name: string;
  title?: string;
  about?: string;
  skills: SkillGroup[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  contact: ContactInfo;
  rawText: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
}

/** AI-enhanced portfolio content */
export interface EnhancedPortfolio extends ParsedResume {
  tagline: string;
  about: string;
  roleType: RoleType;
  improvements: string[];
  seo: SeoMeta;
  uiOverrides?: {
    accentColor?: AccentColor | null;
    template?: PortfolioStyle;
    hideMetrics?: boolean;
    hideContact?: boolean;
    isDark?: boolean | null;
  };
}

export interface PortfolioVersion {
  id: string;
  label: string;
  createdAt: number;
  data: EnhancedPortfolio;
  template: PortfolioStyle;
  tone: ToneMode;
}

export interface ContentGapResult {
  missingSections: string[];
  suggestions: string[];
  score: number;
}

export interface RoleDetectionResult {
  roleType: RoleType;
  confidence: number;
  reasoning: string;
}

export type AccentColor = "violet" | "emerald" | "amber";

/** Central application state shape */
export interface PortfolioAppState {
  userData: ParsedResume | null;
  aiEnhancedData: EnhancedPortfolio | null;
  editedData: EnhancedPortfolio | null;
  selectedTemplate: PortfolioStyle;
  accentColor: AccentColor | null;
  isDark: boolean | null;
  tone: ToneMode;
  versions: PortfolioVersion[];
  activeVersionId: string | null;
  step: "upload" | "processing" | "preview";
  error: string | null;
  aiEnabled: boolean;
  contentGaps: ContentGapResult | null;
}
