"use client";

import React, { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Plus, Trash2, ChevronDown, ChevronRight, RotateCcw, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TechInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TechInput({ value, onChange }: TechInputProps) {
  const [inputValue, setInputValue] = useState((value || []).join(", "));
  const [prevValue, setPrevValue] = useState(value);

  // Sync state during render when prop value changes
  if (JSON.stringify(prevValue) !== JSON.stringify(value)) {
    setPrevValue(value);
    const incoming = value || [];
    const currentParsed = inputValue.split(",").map((s) => s.trim()).filter(Boolean);
    if (JSON.stringify(currentParsed) !== JSON.stringify(incoming)) {
      setInputValue(incoming.join(", "));
    }
  }

  const handleChange = (val: string) => {
    setInputValue(val);
    const parsed = val.split(",").map((s) => s.trim()).filter(Boolean);
    onChange(parsed);
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => handleChange(e.target.value)}
      className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
    />
  );
}

// Main container component with title, regenerate and revert buttons
interface FormWrapperProps {
  section: "hero" | "about" | "skills" | "projects" | "experience" | "education";
  title: string;
  children: React.ReactNode;
}

export function FormWrapper({ section, title, children }: FormWrapperProps) {
  const { revertSection, userData } = usePortfolioStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="overflow-hidden border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900/80 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-100 transition-colors hover:text-white"
        >
          {expanded ? <ChevronDown className="h-4 w-4 text-indigo-400" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
          {title}
        </button>
        <div className="flex items-center gap-2">
          {userData && (
            <button
              onClick={() => revertSection(section)}
              className="flex items-center gap-1 rounded bg-zinc-800/50 px-2 py-1 text-2xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              title="Revert this section to its original resume content"
            >
              <RotateCcw className="h-3 w-3" />
              Revert
            </button>
          )}
        </div>
      </div>
      {expanded && <div className="p-4 space-y-4">{children}</div>}
    </Card>
  );
}

// 1. Hero & Contact Form Editor
export function HeroFormEditor() {
  const editedData = usePortfolioStore((s) => s.editedData);
  const updateEditedField = usePortfolioStore((s) => s.updateEditedField);

  if (!editedData) return null;

  return (
    <FormWrapper section="hero" title="Hero & Profile Headers">
      <div className="grid gap-3">
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Name</label>
          <input
            type="text"
            value={editedData.name || ""}
            onChange={(e) => updateEditedField("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Profile Photo URL</label>
          <div className="mt-1 flex flex-col gap-2">
            <input
              type="text"
              value={editedData.contact?.avatarUrl || ""}
              onChange={(e) => updateEditedField("contact.avatarUrl", e.target.value)}
              placeholder="e.g. https://example.com/photo.jpg or relative path"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-2 items-center">
              <label className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-zinc-400" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        updateEditedField("contact.avatarUrl", reader.result);
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
                  const promptStr = window.prompt("Enter prompt to generate avatar (e.g. 'professional developer avatar, neon glow, cyberpunk'):");
                  if (promptStr) {
                    const encoded = encodeURIComponent(promptStr.trim());
                    const genUrl = `https://image.pollinations.ai/prompt/${encoded}?width=600&height=400&nologo=true&private=true`;
                    updateEditedField("contact.avatarUrl", genUrl);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-900/35 bg-indigo-950/20 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-950/30 hover:text-indigo-300 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span>AI Generate</span>
              </button>

              {editedData.contact?.avatarUrl && (
                <button
                  type="button"
                  onClick={() => updateEditedField("contact.avatarUrl", "")}
                  className="flex items-center gap-1 rounded bg-zinc-850 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Role Title</label>
          <input
            type="text"
            value={editedData.title || ""}
            onChange={(e) => updateEditedField("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">AI Tagline</label>
          <input
            type="text"
            value={editedData.tagline || ""}
            onChange={(e) => updateEditedField("tagline", e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <h4 className="mb-3 text-xs font-semibold text-zinc-400">Contact Information</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Email</label>
            <input
              type="email"
              value={editedData.contact?.email || ""}
              onChange={(e) => updateEditedField("contact.email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Phone</label>
            <input
              type="text"
              value={editedData.contact?.phone || ""}
              onChange={(e) => updateEditedField("contact.phone", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Location</label>
            <input
              type="text"
              value={editedData.contact?.location || ""}
              onChange={(e) => updateEditedField("contact.location", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Website</label>
            <input
              type="text"
              value={editedData.contact?.website || ""}
              onChange={(e) => updateEditedField("contact.website", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">LinkedIn</label>
            <input
              type="text"
              value={editedData.contact?.linkedin || ""}
              onChange={(e) => updateEditedField("contact.linkedin", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">GitHub</label>
            <input
              type="text"
              value={editedData.contact?.github || ""}
              onChange={(e) => updateEditedField("contact.github", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </FormWrapper>
  );
}

// 2. About Form Editor
export function AboutFormEditor() {
  const editedData = usePortfolioStore((s) => s.editedData);
  const updateEditedField = usePortfolioStore((s) => s.updateEditedField);

  if (!editedData) return null;

  return (
    <FormWrapper section="about" title="About Me Narrative">
      <div>
        <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-500">Bio Paragraph</label>
        <textarea
          rows={6}
          value={editedData.about || ""}
          onChange={(e) => updateEditedField("about", e.target.value)}
          placeholder="Describe your professional background, skills, and unique value proposition..."
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </FormWrapper>
  );
}

// 3. Skills Form Editor
export function SkillsFormEditor() {
  const editedData = usePortfolioStore((s) => s.editedData);
  const updateEditedField = usePortfolioStore((s) => s.updateEditedField);
  const addSkillGroup = usePortfolioStore((s) => s.addSkillGroup);
  const deleteSkillGroup = usePortfolioStore((s) => s.deleteSkillGroup);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [newSkillText, setNewSkillText] = useState<Record<number, string>>({});

  if (!editedData) return null;

  const handleAddSkill = (groupIndex: number) => {
    const text = newSkillText[groupIndex]?.trim();
    if (!text) return;

    const group = editedData.skills[groupIndex];
    const updatedItems = [...group.items, text];
    updateEditedField(`skills.${groupIndex}.items`, updatedItems);
    setNewSkillText({ ...newSkillText, [groupIndex]: "" });
  };

  const handleRemoveSkill = (groupIndex: number, skillIndex: number) => {
    const group = editedData.skills[groupIndex];
    const updatedItems = group.items.filter((_, idx) => idx !== skillIndex);
    updateEditedField(`skills.${groupIndex}.items`, updatedItems);
  };

  return (
    <FormWrapper section="skills" title="Skills Categorization">
      <div className="space-y-3">
        {editedData.skills.map((group, groupIdx) => {
          const isExpanded = expandedIndex === groupIdx;
          return (
            <div key={groupIdx} className="rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <div className="flex items-center justify-between bg-zinc-900/40 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : groupIdx)}
                  className="flex flex-1 items-center gap-1.5 text-xs font-medium text-zinc-300 text-left hover:text-white"
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
                  {group.category || `Category #${groupIdx + 1}`}
                  <span className="text-3xs text-zinc-500">({group.items.length} skills)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteSkillGroup(groupIdx);
                    if (expandedIndex === groupIdx) setExpandedIndex(null);
                  }}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="p-3 space-y-3">
                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Category Name</label>
                    <input
                      type="text"
                      value={group.category || ""}
                      onChange={(e) => updateEditedField(`skills.${groupIdx}.category`, e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Skill Tags</label>
                    <div className="mt-1 flex flex-wrap gap-1.5 rounded-lg border border-zinc-850 bg-zinc-950/50 p-2 min-h-[50px]">
                      {group.items.map((item, itemIdx) => (
                        <span
                          key={itemIdx}
                          className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-2xs font-medium text-zinc-300"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(groupIdx, itemIdx)}
                            className="text-zinc-500 hover:text-white"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {group.items.length === 0 && (
                        <span className="text-2xs text-zinc-700 italic">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. React)..."
                      value={newSkillText[groupIdx] || ""}
                      onChange={(e) => setNewSkillText({ ...newSkillText, [groupIdx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill(groupIdx);
                        }
                      }}
                      className="flex-1 rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSkill(groupIdx)}
                      className="px-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={addSkillGroup}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-800 py-2.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Skill Category
      </button>
    </FormWrapper>
  );
}

// 4. Projects Form Editor
export function ProjectsFormEditor() {
  const editedData = usePortfolioStore((s) => s.editedData);
  const updateEditedField = usePortfolioStore((s) => s.updateEditedField);
  const addProject = usePortfolioStore((s) => s.addProject);
  const deleteProject = usePortfolioStore((s) => s.deleteProject);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!editedData) return null;

  return (
    <FormWrapper section="projects" title="Projects & Case Studies">
      <div className="space-y-3">
        {editedData.projects.map((project, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <div className="flex items-center justify-between bg-zinc-900/40 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex flex-1 items-center gap-1.5 text-xs font-medium text-zinc-300 text-left hover:text-white"
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
                  {project.name || `Project #${idx + 1}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProject(idx);
                    if (expandedIndex === idx) setExpandedIndex(null);
                  }}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Project Title</label>
                      <input
                        type="text"
                        value={project.name || ""}
                        onChange={(e) => updateEditedField(`projects.${idx}.name`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Duration / Period</label>
                      <input
                        type="text"
                        value={project.period || ""}
                        onChange={(e) => updateEditedField(`projects.${idx}.period`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Project Link</label>
                    <input
                      type="text"
                      value={project.link || ""}
                      onChange={(e) => updateEditedField(`projects.${idx}.link`, e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Project Image URL</label>
                    <div className="mt-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={project.imageUrl || ""}
                        onChange={(e) => updateEditedField(`projects.${idx}.imageUrl`, e.target.value)}
                        placeholder="e.g. https://example.com/project.png or relative path"
                        className="w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer">
                          <Upload className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === "string") {
                                  updateEditedField(`projects.${idx}.imageUrl`, reader.result);
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
                            const promptStr = window.prompt("Enter prompt to generate project image (e.g. 'ecommerce checkout page dashboard design, modern startup style'):");
                            if (promptStr) {
                              const encoded = encodeURIComponent(promptStr.trim());
                              const genUrl = `https://image.pollinations.ai/prompt/${encoded}?width=600&height=400&nologo=true&private=true`;
                              updateEditedField(`projects.${idx}.imageUrl`, genUrl);
                            }
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-indigo-900/35 bg-indigo-950/20 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-950/30 hover:text-indigo-300 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                          <span>AI Generate</span>
                        </button>

                        {project.imageUrl && (
                          <button
                            type="button"
                            onClick={() => updateEditedField(`projects.${idx}.imageUrl`, "")}
                            className="flex items-center gap-1 rounded bg-zinc-850 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      {project.imageUrl && (
                        <div className="mt-1 relative h-20 w-32 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={project.imageUrl} alt="Project mockup preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Project Narrative</label>
                    <textarea
                      rows={3}
                      value={project.description || ""}
                      onChange={(e) => updateEditedField(`projects.${idx}.description`, e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 p-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Technologies (comma-separated)</label>
                    <TechInput
                      value={project.technologies || []}
                      onChange={(list) => updateEditedField(`projects.${idx}.technologies`, list)}
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Key Highlights</label>
                    <div className="mt-1 space-y-2">
                      {project.highlights?.map((high, highIdx) => (
                        <div key={highIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={high || ""}
                            onChange={(e) => updateEditedField(`projects.${idx}.highlights.${highIdx}`, e.target.value)}
                            className="flex-1 rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = project.highlights.filter((_, hIdx) => hIdx !== highIdx);
                              updateEditedField(`projects.${idx}.highlights`, updated);
                            }}
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(project.highlights || []), ""];
                          updateEditedField(`projects.${idx}.highlights`, updated);
                        }}
                        className="flex items-center gap-1 text-2xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Highlight Bullet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={addProject}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-800 py-2.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Project
      </button>
    </FormWrapper>
  );
}

// 5. Experience Form Editor
export function ExperienceFormEditor() {
  const editedData = usePortfolioStore((s) => s.editedData);
  const updateEditedField = usePortfolioStore((s) => s.updateEditedField);
  const addExperience = usePortfolioStore((s) => s.addExperience);
  const deleteExperience = usePortfolioStore((s) => s.deleteExperience);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!editedData) return null;

  return (
    <FormWrapper section="experience" title="Work History & Experience">
      <div className="space-y-3">
        {editedData.experience.map((exp, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <div className="flex items-center justify-between bg-zinc-900/40 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex flex-1 items-center gap-1.5 text-xs font-medium text-zinc-300 text-left hover:text-white"
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
                  {exp.role ? `${exp.role} @ ${exp.company}` : `Job #${idx + 1}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteExperience(idx);
                    if (expandedIndex === idx) setExpandedIndex(null);
                  }}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Company Name</label>
                      <input
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) => updateEditedField(`experience.${idx}.company`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Role / Job Title</label>
                      <input
                        type="text"
                        value={exp.role || ""}
                        onChange={(e) => updateEditedField(`experience.${idx}.role`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Duration / Period</label>
                      <input
                        type="text"
                        value={exp.period || ""}
                        onChange={(e) => updateEditedField(`experience.${idx}.period`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Location</label>
                      <input
                        type="text"
                        value={exp.location || ""}
                        onChange={(e) => updateEditedField(`experience.${idx}.location`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Short Summary</label>
                    <textarea
                      rows={2}
                      value={exp.description || ""}
                      onChange={(e) => updateEditedField(`experience.${idx}.description`, e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 p-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Key Achievements</label>
                    <div className="mt-1 space-y-2">
                      {exp.achievements?.map((ach, achIdx) => (
                        <div key={achIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={ach || ""}
                            onChange={(e) => updateEditedField(`experience.${idx}.achievements.${achIdx}`, e.target.value)}
                            className="flex-1 rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = exp.achievements.filter((_, aIdx) => aIdx !== achIdx);
                              updateEditedField(`experience.${idx}.achievements`, updated);
                            }}
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(exp.achievements || []), ""];
                          updateEditedField(`experience.${idx}.achievements`, updated);
                        }}
                        className="flex items-center gap-1 text-2xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Achievement Bullet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={addExperience}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-800 py-2.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Experience
      </button>
    </FormWrapper>
  );
}

// 6. Education Form Editor
export function EducationFormEditor() {
  const editedData = usePortfolioStore((s) => s.editedData);
  const updateEditedField = usePortfolioStore((s) => s.updateEditedField);
  const addEducation = usePortfolioStore((s) => s.addEducation);
  const deleteEducation = usePortfolioStore((s) => s.deleteEducation);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!editedData) return null;

  return (
    <FormWrapper section="education" title="Academic & Certifications">
      <div className="space-y-3">
        {editedData.education.map((edu, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <div className="flex items-center justify-between bg-zinc-900/40 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex flex-1 items-center gap-1.5 text-xs font-medium text-zinc-300 text-left hover:text-white"
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
                  {edu.institution ? `${edu.degree} — ${edu.institution}` : `Education #${idx + 1}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteEducation(idx);
                    if (expandedIndex === idx) setExpandedIndex(null);
                  }}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isExpanded && (
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Institution</label>
                      <input
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) => updateEditedField(`education.${idx}.institution`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Degree / Focus</label>
                      <input
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) => updateEditedField(`education.${idx}.degree`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Period / Year</label>
                      <input
                        type="text"
                        value={edu.period || ""}
                        onChange={(e) => updateEditedField(`education.${idx}.period`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-semibold uppercase tracking-wider text-zinc-500">Details / Grade</label>
                      <input
                        type="text"
                        value={edu.details || ""}
                        onChange={(e) => updateEditedField(`education.${idx}.details`, e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-850 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={addEducation}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-800 py-2.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Education
      </button>
    </FormWrapper>
  );
}
