/* eslint-disable @next/next/no-img-element */
"use client";
import type { EnhancedPortfolio, PortfolioStyle } from "@/types/portfolio";
import { sectionThemes } from "./theme";
import { Terminal, Sparkles, Briefcase } from "lucide-react";
import { InlineEdit } from "../InlineEdit";
import { AvatarUpload } from "../AvatarUpload";

interface HeroSectionProps {
  data: EnhancedPortfolio;
  style: PortfolioStyle;
  onUpdate?: (path: string, value: unknown) => void;
}

export function HeroSection({ data, style, onUpdate }: HeroSectionProps) {
  const t = sectionThemes[style];
  const role = data.roleType || "general";

  const field = (path: string) => (val: string) => onUpdate?.(path, val);
  const avatarSrc = data.contact?.avatarUrl || "/avatar.png";

  // 1. Technical/Developer Layout Accent
  if (style === "developer") {
    return (
      <header className={`border-b ${t.border} bg-[var(--bg-main)] px-6 py-16 md:px-12 md:py-24 font-mono text-[var(--text-main)]`}>
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row gap-6 items-center w-full">
          <div className="flex-1 space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2 text-[var(--accent-color)]">
              <Terminal className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">~/portfolio --role={role}</span>
              <span className="h-2 w-2 animate-ping rounded-full bg-[var(--accent-color)]" />
            </div>
            
            <div className="space-y-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6 shadow-xl overflow-x-auto w-full break-all">
              <p className="text-xs text-[var(--text-muted)]">
                <span className="text-[#ff7b72]">import</span> &#123; <span className="text-[#a5d6ff]">ProfessionalProfile</span> &#125; <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">&apos;talent&apos;</span>;
              </p>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">
                <span className="text-[#ff7b72]">const</span>{" "}
                <span className="text-[#d2a8ff]">{data.name.split(" ")[0].toLowerCase() || "engineer"}</span> = &#123;
                <div className="pl-4 sm:pl-6 pt-2 text-base sm:text-lg font-medium">
                  name: <span className="text-[#a5d6ff]">&quot;</span>
                  <InlineEdit
                    as="span"
                    value={data.name}
                    onChange={field("name")}
                    className="text-[#a5d6ff] font-medium"
                    placeholder="Your Name"
                  />
                  <span className="text-[#a5d6ff]">&quot;</span>,<br />
                  title: <span className="text-[#a5d6ff]">&quot;</span>
                  <InlineEdit
                    as="span"
                    value={data.title || "Software Architect"}
                    onChange={field("title")}
                    className="text-[#a5d6ff] font-medium"
                    placeholder="Your Title"
                  />
                  <span className="text-[#a5d6ff]">&quot;</span>
                </div>
                &#125;;
              </h1>
              <p className="mt-4 border-t border-[var(--border-color)] pt-4 text-xs text-[var(--text-muted)] leading-relaxed">
                <span className="text-[var(--accent-color)]">{"// biography:"}</span>{" "}
                <InlineEdit
                  as="span"
                  value={data.tagline}
                  onChange={field("tagline")}
                  className="text-[var(--text-muted)]"
                  placeholder="Your tagline…"
                />
              </p>
            </div>
          </div>

          <div className="w-full md:w-56 shrink-0">
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 text-center shadow-xl">
              <div className="flex justify-between border-b border-[var(--border-color)]/50 pb-2 mb-3 text-3xs text-[var(--text-muted)]">
                <span>profile_pic.png</span>
                <span className="text-[var(--accent-color)]">[OK]</span>
              </div>
              <AvatarUpload
                src={avatarSrc}
                alt={data.name}
                onChange={(url) => onUpdate?.("contact.avatarUrl", url)}
                shape="rounded"
                size="h-32 w-32"
                imgClassName="mx-auto border border-[var(--border-color)] bg-[var(--bg-main)] hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 2. Creative/Designer Layout Accent (Visual-heavy)
  if (style === "creative") {
    return (
      <header className="relative overflow-hidden px-6 py-20 text-center md:px-12 md:py-28 bg-[var(--bg-main)] text-[var(--text-main)]">
        {/* Glow Backdrops */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-72 w-72 rounded-full bg-[var(--accent-color)]/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-72 w-72 rounded-full bg-[var(--accent-hover)]/10 blur-3xl" />
        
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          {/* Glowing Avatar with upload */}
          <div className="mb-8 relative h-36 w-36 animate-float">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--accent-color)] to-[var(--accent-hover)] blur-md opacity-60" />
            <AvatarUpload
              src={avatarSrc}
              alt={data.name}
              onChange={(url) => onUpdate?.("contact.avatarUrl", url)}
              shape="circle"
              size="h-36 w-36"
              imgClassName="relative border-4 border-[var(--border-color)] shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--accent-bg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-color)]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Creative Portfolio
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl leading-none">
            <InlineEdit
              as="span"
              value={data.name}
              onChange={field("name")}
              className="bg-gradient-to-r from-[var(--text-main)] via-[var(--accent-color)] to-[var(--accent-hover)] bg-clip-text text-transparent"
              placeholder="Your Name"
            />
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">
            <InlineEdit
              as="span"
              value={data.tagline}
              onChange={field("tagline")}
              placeholder="Your tagline…"
            />
          </p>
          
          <div className="mt-8 flex justify-center gap-2">
            <span className="rounded-full bg-[var(--accent-bg)] border border-[var(--border-color)] px-3 py-1 text-2xs uppercase tracking-wider text-[var(--accent-color)]">
              <InlineEdit
                as="span"
                value={data.title || "Visual Communicator"}
                onChange={field("title")}
                placeholder="Your Title"
              />
            </span>
          </div>
        </div>
      </header>
    );
  }

  // 3. Student / General Layout Accent (Structured & Clean)
  return (
    <header className={`border-b ${t.border} bg-[var(--bg-main)] px-6 py-16 md:px-12 md:py-24 text-[var(--text-main)]`}>
      <div className="mx-auto max-w-4xl flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1 text-left">
          <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <Briefcase className="h-3.5 w-3.5 text-[var(--accent-color)]" />
            Professional Profile
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-main)] sm:text-5xl md:text-6xl font-sans">
            <InlineEdit
              as="span"
              value={data.name}
              onChange={field("name")}
              placeholder="Your Name"
            />
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--text-main)] leading-relaxed font-semibold">
            <InlineEdit
              as="span"
              value={data.title || "Aspiring Specialist"}
              onChange={field("title")}
              placeholder="Your Title"
            />
          </p>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)] leading-relaxed">
            <InlineEdit
              as="span"
              value={data.tagline}
              onChange={field("tagline")}
              placeholder="Your tagline…"
            />
          </p>
        </div>
        <div className="w-40 shrink-0">
          <AvatarUpload
            src={avatarSrc}
            alt={data.name}
            onChange={(url) => onUpdate?.("contact.avatarUrl", url)}
            shape="circle"
            size="h-40 w-40"
            imgClassName="border-2 border-[var(--border-color)] shadow-md"
          />
        </div>
      </div>
    </header>
  );
}
