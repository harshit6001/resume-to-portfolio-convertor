"use client";

import {
  HeroFormEditor,
  AboutFormEditor,
  SkillsFormEditor,
  ProjectsFormEditor,
  ExperienceFormEditor,
  EducationFormEditor,
} from "./SectionFormEditor";
import { usePortfolioStore } from "@/store/portfolio-store";

interface EditSidebarProps {
  className?: string;
}

export function EditSidebar({ className }: EditSidebarProps) {
  const editedData = usePortfolioStore((s) => s.editedData);

  if (!editedData) return null;

  return (
    <div className={`${className} flex flex-col gap-4 pb-10`}>
      {/* Hero Header Form */}
      <div id="editor-section-hero">
        <HeroFormEditor />
      </div>

      {/* About narrative Form */}
      <div id="editor-section-about">
        <AboutFormEditor />
      </div>

      {/* Skills Group Form */}
      <div id="editor-section-skills">
        <SkillsFormEditor />
      </div>

      {/* Experience Timeline Form */}
      <div id="editor-section-experience">
        <ExperienceFormEditor />
      </div>

      {/* Projects Case Study Form */}
      <div id="editor-section-projects">
        <ProjectsFormEditor />
      </div>

      {/* Education Accordion Form */}
      <div id="editor-section-education">
        <EducationFormEditor />
      </div>
    </div>
  );
}
