"use client";

import { useCallback, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  onTextSubmit: (text: string) => void;
  onFileSubmit: (file: File) => void;
  isLoading?: boolean;
}

export function ResumeUploader({
  onTextSubmit,
  onFileSubmit,
  isLoading,
}: ResumeUploaderProps) {
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type === "text/plain" || file.name.endsWith(".docx"))) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (mode === "text" && text.trim()) {
      onTextSubmit(text.trim());
    } else if (mode === "upload" && selectedFile) {
      onFileSubmit(selectedFile);
    }
  };

  const canSubmit =
    !isLoading && ((mode === "text" && text.trim().length > 50) || (mode === "upload" && selectedFile));

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 flex gap-2 rounded-xl bg-zinc-800/50 p-1">
        <button
          onClick={() => setMode("upload")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            mode === "upload"
              ? "bg-indigo-600 text-white"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
        <button
          onClick={() => setMode("text")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            mode === "text"
              ? "bg-indigo-600 text-white"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <FileText className="h-4 w-4" />
          Paste Text
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
            dragActive
              ? "border-indigo-500 bg-indigo-500/5"
              : "border-zinc-700 hover:border-zinc-500"
          )}
        >
          <input
            type="file"
            accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          {selectedFile ? (
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-indigo-400" />
              <div>
                <p className="font-medium text-white">{selectedFile.name}</p>
                <p className="text-sm text-zinc-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="ml-4 rounded-full p-1 hover:bg-zinc-800"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mb-4 h-10 w-10 text-zinc-500" />
              <p className="text-center font-medium text-zinc-300">
                Drop your resume here or click to browse
              </p>
              <p className="mt-1 text-sm text-zinc-500">PDF, DOCX or TXT · Max 10MB</p>
            </>
          )}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your resume text here...

Include sections like:
• Name & contact info
• Summary / About
• Skills
• Experience with bullet points
• Projects
• Education"
          className="min-h-[220px] w-full resize-y rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
          {isLoading ? "Analyzing Resume..." : "Generate Portfolio →"}
        </Button>
      </div>
    </Card>
  );
}
