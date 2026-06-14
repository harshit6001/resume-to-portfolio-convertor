"use client";

import { History, RotateCcw } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";

export function VersionHistory() {
  const versions = usePortfolioStore((s) => s.versions);
  const activeVersionId = usePortfolioStore((s) => s.activeVersionId);
  const revertToVersion = usePortfolioStore((s) => s.revertToVersion);
  const saveVersion = usePortfolioStore((s) => s.saveVersion);

  if (versions.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <History className="h-3 w-3" />
          Versions
        </p>
        <button
          onClick={() => saveVersion()}
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          Save current
        </button>
      </div>
      <div className="space-y-1">
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => revertToVersion(v.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
              activeVersionId === v.id
                ? "bg-indigo-500/10 text-indigo-300"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <span>{v.label}</span>
            {activeVersionId !== v.id && (
              <RotateCcw className="h-3 w-3 opacity-50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
