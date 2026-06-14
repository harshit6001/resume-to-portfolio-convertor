"use client";

import type { ToneMode } from "@/types/portfolio";
import { cn } from "@/lib/utils";

const TONES: { id: ToneMode; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Polished & recruiter-ready" },
  { id: "creative", label: "Creative", desc: "Expressive & narrative" },
  { id: "startup", label: "Startup", desc: "Energetic & impact-driven" },
];

interface ToneSelectorProps {
  selected: ToneMode;
  onSelect: (tone: ToneMode) => void;
  onApply?: (tone: ToneMode) => void;
  applying?: boolean;
}

export function ToneSelector({ selected, onSelect, onApply, applying }: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      {TONES.map((tone) => (
        <button
          key={tone.id}
          onClick={() => {
            onSelect(tone.id);
            onApply?.(tone.id);
          }}
          disabled={applying}
          className={cn(
            "w-full rounded-lg border p-3 text-left transition-all",
            selected === tone.id
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-zinc-800 hover:border-zinc-600"
          )}
        >
          <p className="text-sm font-medium text-white">{tone.label}</p>
          <p className="text-xs text-zinc-500">{tone.desc}</p>
        </button>
      ))}
    </div>
  );
}
