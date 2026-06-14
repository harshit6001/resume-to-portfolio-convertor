"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  src: string;
  alt: string;
  onChange: (dataUrl: string) => void;
  imgClassName?: string;
  /** Shape: 'circle' | 'rounded' */
  shape?: "circle" | "rounded";
  size?: string; // e.g. "h-36 w-36"
}

export function AvatarUpload({
  src,
  alt,
  onChange,
  imgClassName = "",
  shape = "circle",
  size = "h-36 w-36",
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const borderRadius = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className={`relative group ${size} cursor-pointer`} onClick={() => inputRef.current?.click()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${size} ${borderRadius} object-cover ${imgClassName} transition-all duration-300 group-hover:brightness-50`}
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 ${borderRadius} flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
      >
        <Camera className="h-6 w-6 text-white drop-shadow" />
        <span className="text-[10px] font-semibold text-white drop-shadow leading-none">
          Upload Photo
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
