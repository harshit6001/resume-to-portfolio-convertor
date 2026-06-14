"use client";

import { create } from "zustand";
import type {
  EnhancedPortfolio,
  ParsedResume,
  PortfolioAppState,
  PortfolioStyle,
  PortfolioVersion,
  ToneMode,
  EditableSection,
} from "@/types/portfolio";

function clonePortfolio(data: EnhancedPortfolio): EnhancedPortfolio {
  return JSON.parse(JSON.stringify(data));
}

function createVersion(
  data: EnhancedPortfolio,
  template: PortfolioStyle,
  tone: ToneMode,
  label: string
): PortfolioVersion {
  return {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    createdAt: Date.now(),
    data: clonePortfolio(data),
    template,
    tone,
  };
}

interface PortfolioStore extends PortfolioAppState {
  setProcessing: () => void;
  setError: (error: string) => void;
  setPipelineResult: (params: {
    userData: ParsedResume;
    aiEnhancedData: EnhancedPortfolio;
    aiEnabled: boolean;
    contentGaps?: PortfolioAppState["contentGaps"];
  }) => void;
  setTemplate: (template: PortfolioStyle) => void;
  setTone: (tone: ToneMode) => void;
  updateEditedField: (path: string, value: unknown) => void;
  applyEditedData: (data: EnhancedPortfolio) => void;
  saveVersion: (label?: string) => void;
  revertToVersion: (versionId: string) => void;
  revertSection: (section: EditableSection) => void;
  addProject: () => void;
  deleteProject: (index: number) => void;
  addExperience: () => void;
  deleteExperience: (index: number) => void;
  addEducation: () => void;
  deleteEducation: (index: number) => void;
  addSkillGroup: () => void;
  deleteSkillGroup: (index: number) => void;
  reset: () => void;
  getDisplayData: () => EnhancedPortfolio | null;
}

const initialState: PortfolioAppState = {
  userData: null,
  aiEnhancedData: null,
  editedData: null,
  selectedTemplate: "minimal",
  tone: "professional",
  versions: [],
  activeVersionId: null,
  step: "upload",
  error: null,
  aiEnabled: false,
  contentGaps: null,
};

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || current[key] === null) {
      // If the next key is a number, initialize as array, else as object
      const nextKey = keys[i + 1];
      const isNextKeyIndex = !isNaN(Number(nextKey));
      current[key] = isNextKeyIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  ...initialState,

  setProcessing: () => set({ step: "processing", error: null }),

  setError: (error) => set({ error, step: "upload" }),

  setPipelineResult: ({ userData, aiEnhancedData, aiEnabled, contentGaps }) => {
    const version = createVersion(
      aiEnhancedData,
      get().selectedTemplate,
      get().tone,
      "v1 — Initial"
    );
    set({
      userData,
      aiEnhancedData,
      editedData: clonePortfolio(aiEnhancedData),
      step: "preview",
      aiEnabled,
      contentGaps,
      versions: [version],
      activeVersionId: version.id,
      error: null,
    });
  },

  setTemplate: (template) => set({ selectedTemplate: template }),

  setTone: (tone) => set({ tone }),

  updateEditedField: (path, value) => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    setNestedValue(updated as unknown as Record<string, unknown>, path, value);
    set({ editedData: updated });
  },

  applyEditedData: (data) => set({ editedData: clonePortfolio(data) }),

  saveVersion: (label) => {
    const { editedData, selectedTemplate, tone, versions } = get();
    if (!editedData) return;
    const version = createVersion(
      editedData,
      selectedTemplate,
      tone,
      label || `v${versions.length + 1}`
    );
    set({
      versions: [...versions, version],
      activeVersionId: version.id,
    });
  },

  revertToVersion: (versionId) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (!version) return;
    set({
      editedData: clonePortfolio(version.data),
      selectedTemplate: version.template,
      tone: version.tone,
      activeVersionId: versionId,
    });
  },

  revertSection: (section) => {
    const { userData, editedData } = get();
    if (!userData || !editedData) return;
    const updated = clonePortfolio(editedData);
    const originalValue = getOriginalForSection(userData, section);
    if (section === "hero") {
      const hero = originalValue as { name: string; title: string; tagline: string };
      updated.name = hero.name || "";
      updated.title = hero.title || "";
      updated.tagline = hero.tagline || "";
    } else {
      (updated as unknown as Record<string, unknown>)[section] = JSON.parse(JSON.stringify(originalValue));
    }
    set({ editedData: updated });
  },

  addProject: () => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.projects.push({
      name: "New Project",
      description: "Project description goes here...",
      highlights: ["Key achievement or detail of the project."],
      technologies: ["Tech1", "Tech2"],
      link: "",
      period: "Present",
    });
    set({ editedData: updated });
  },

  deleteProject: (index) => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.projects.splice(index, 1);
    set({ editedData: updated });
  },

  addExperience: () => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.experience.push({
      company: "New Company",
      role: "Job Title",
      period: "Month Year - Month Year",
      location: "City, Country",
      description: "Brief summary of your role...",
      achievements: ["Drove key initiative resulting in X% improvement."],
    });
    set({ editedData: updated });
  },

  deleteExperience: (index) => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.experience.splice(index, 1);
    set({ editedData: updated });
  },

  addEducation: () => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.education.push({
      institution: "Institution Name",
      degree: "Degree / Certificate",
      period: "Year - Year",
      details: "",
    });
    set({ editedData: updated });
  },

  deleteEducation: (index) => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.education.splice(index, 1);
    set({ editedData: updated });
  },

  addSkillGroup: () => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.skills.push({
      category: "New Skill Group",
      items: ["Skill1", "Skill2"],
    });
    set({ editedData: updated });
  },

  deleteSkillGroup: (index) => {
    const { editedData } = get();
    if (!editedData) return;
    const updated = clonePortfolio(editedData);
    updated.skills.splice(index, 1);
    set({ editedData: updated });
  },

  reset: () => set(initialState),

  getDisplayData: () => get().editedData,
}));

export function getOriginalForSection(
  userData: ParsedResume | null,
  section: EditableSection
): unknown {
  if (!userData) return null;
  switch (section) {
    case "hero":
      return { name: userData.name, title: userData.title, tagline: userData.title };
    case "about":
      return userData.about;
    case "skills":
      return userData.skills;
    case "projects":
      return userData.projects;
    case "experience":
      return userData.experience;
    case "education":
      return userData.education;
    case "contact":
      return userData.contact;
    default:
      return null;
  }
}
