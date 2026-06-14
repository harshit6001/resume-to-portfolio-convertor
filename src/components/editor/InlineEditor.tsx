"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function InlineEditor({
  value,
  onChange,
  className,
  multiline = false,
  placeholder,
}: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className={cn(
          "cursor-text rounded-md px-2 py-1 transition-colors hover:bg-zinc-800/50 hover:ring-1 hover:ring-indigo-500/30",
          !value && "text-zinc-500",
          className
        )}
        title="Click to edit"
      >
        {value || placeholder || "Click to edit..."}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
        }}
        className={cn(
          "w-full rounded-md border border-indigo-500/50 bg-zinc-900 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
          className
        )}
        rows={4}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") setEditing(false);
      }}
      className={cn(
        "w-full rounded-md border border-indigo-500/50 bg-zinc-900 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
    />
  );
}
