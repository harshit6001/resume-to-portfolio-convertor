"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EditableSection } from "@/types/portfolio";
import { usePortfolioStore } from "@/store/portfolio-store";

interface RegenerateButtonProps {
  section: EditableSection;
  getContent: () => unknown;
  onRegenerated: (content: unknown) => void;
}

export function RegenerateButton({
  section,
  getContent,
  onRegenerated,
}: RegenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const tone = usePortfolioStore((s) => s.tone);
  const editedData = usePortfolioStore((s) => s.editedData);
  const aiEnabled = usePortfolioStore((s) => s.aiEnabled);

  async function handleRegenerate() {
    if (!editedData) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          content: getContent(),
          tone,
          roleType: editedData.roleType,
        }),
      });
      const json = await res.json();
      if (res.ok && json.enhanced) {
        onRegenerated(json.enhanced);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!aiEnabled) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={loading}
      className="gap-1.5 text-xs"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      Regenerate with AI
    </Button>
  );
}
