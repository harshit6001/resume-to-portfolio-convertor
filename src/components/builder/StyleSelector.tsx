"use client";

import { cn } from "@/lib/utils";
import type { PortfolioStyle } from "@/types/portfolio";
import { Briefcase, Code2, Palette } from "lucide-react";

interface StyleSelectorProps {
  selected: PortfolioStyle;
  onSelect: (style: PortfolioStyle) => void;
}

const styles: {
  id: PortfolioStyle;
  name: string;
  description: string;
  icon: typeof Briefcase;
  preview: string;
}[] = [
  {
    id: "minimal",
    name: "Minimal Professional",
    description: "Clean, recruiter-friendly layout with strong typography",
    icon: Briefcase,
    preview: "bg-white border-zinc-200",
  },
  {
    id: "creative",
    name: "Creative Modern",
    description: "Bold gradients and visual flair for designers & creatives",
    icon: Palette,
    preview: "bg-gradient-to-br from-purple-900 to-pink-900",
  },
  {
    id: "developer",
    name: "Developer Focused",
    description: "Terminal-inspired aesthetic for engineers & tech roles",
    icon: Code2,
    preview: "bg-[#0d1117] border-[#30363d]",
  },
];

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {styles.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            "group rounded-xl border p-4 text-left transition-all",
            selected === s.id
              ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500"
              : "border-zinc-800 hover:border-zinc-600"
          )}
        >
          <div
            className={cn(
              "mb-3 h-16 rounded-lg border",
              s.preview
            )}
          />
          <div className="flex items-center gap-2">
            <s.icon
              className={cn(
                "h-4 w-4",
                selected === s.id ? "text-indigo-400" : "text-zinc-500"
              )}
            />
            <span className="text-sm font-semibold text-white">{s.name}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{s.description}</p>
        </button>
      ))}
    </div>
  );
}
