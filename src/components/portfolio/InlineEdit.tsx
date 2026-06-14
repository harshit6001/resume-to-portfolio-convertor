"use client";

import { useEffect, useRef, useState } from "react";

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  /** Renders as a block (multiline textarea-like). Default: false (inline span) */
  multiline?: boolean;
  /** Tailwind classes for the element when NOT editing */
  className?: string;
  placeholder?: string;
  /** HTML tag to render as. Default: span */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
}

export function InlineEdit({
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = "Click to edit…",
  as: Tag = "span",
}: InlineEditProps) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Keep DOM in sync when value changes externally
  useEffect(() => {
    if (ref.current && !editing) {
      ref.current.innerText = value || "";
    }
  }, [value, editing]);

  const handleFocus = () => {
    setEditing(true);
    setSaved(false);
    // Move caret to end
    const el = ref.current;
    if (el) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const commit = () => {
    const newVal = ref.current?.innerText?.trim() ?? "";
    if (newVal !== value) {
      onChange(newVal);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === "Escape") {
      // Revert
      if (ref.current) ref.current.innerText = value || "";
      setEditing(false);
      ref.current?.blur();
    }
  };

  return (
    <Tag
      // @ts-expect-error ref works fine with dynamic tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={handleFocus}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={[
        className,
        "outline-none cursor-text transition-all duration-150",
        // Hover ring to signal editability
        "hover:bg-indigo-500/8 hover:rounded",
        // Active editing border
        editing
          ? "ring-1 ring-indigo-500/60 bg-indigo-500/5 rounded px-0.5"
          : "",
        // Saved flash
        saved ? "ring-1 ring-emerald-500/60 bg-emerald-500/5 rounded px-0.5" : "",
        // Empty placeholder styling
        !value
          ? "before:content-[attr(data-placeholder)] before:opacity-30 before:italic"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
