"use client";

import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import type { EnhancedPortfolio, PortfolioStyle, AccentColor } from "@/types/portfolio";
import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
    data: EnhancedPortfolio;
    style: PortfolioStyle;
    accentColor?: AccentColor | null;
}

export function PreviewPanel({ data, style, accentColor }: PreviewPanelProps) {
    const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <span className="text-sm font-medium text-zinc-400">Live Preview</span>
                <div className="flex gap-1 rounded-lg bg-zinc-800/50 p-1">
                    <button
                        onClick={() => setViewport("desktop")}
                        className={cn(
                            "rounded-md p-1.5 transition-colors",
                            viewport === "desktop" ? "bg-zinc-700 text-white" : "text-zinc-500"
                        )}
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewport("mobile")}
                        className={cn(
                            "rounded-md p-1.5 transition-colors",
                            viewport === "mobile" ? "bg-zinc-700 text-white" : "text-zinc-500"
                        )}
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto bg-zinc-950 p-4">
                <div
                    className={cn(
                        "mx-auto overflow-hidden rounded-xl border border-zinc-800 shadow-2xl transition-all duration-300",
                        viewport === "mobile" ? "w-[375px]" : "w-full max-w-4xl"
                    )}
                >
                    <PortfolioRenderer data={data} style={style} accentColor={accentColor} />
                </div>
            </div>
        </div>
    );
}
