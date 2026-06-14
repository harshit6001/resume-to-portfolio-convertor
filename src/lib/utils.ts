import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function extractEmail(text: string): string | undefined {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/i);
  return match?.[0];
}

export function extractPhone(text: string): string | undefined {
  const match = text.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  return match?.[0];
}

export function extractLinkedIn(text: string): string | undefined {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  return match?.[0];
}

export function extractGitHub(text: string): string | undefined {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);
  return match?.[0];
}

export function extractUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[\w.-]+(?:\/[\w./?%&=-]*)?/i);
  return match?.[0];
}

export function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
