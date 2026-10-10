/**
 * Pure utility functions for safely displaying attachment metadata.
 * These are intentionally framework-agnostic so they can be tested
 * without a DOM or React renderer.
 */

const SIZE_UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * Convert raw bytes to a human-readable string.
 * Uses base-1024 (binary) units.
 *
 * @example formatBytes(204800)  // "200 KB"
 * @example formatBytes(0)       // "0 B"
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";

  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Drop the decimal when the value is a whole number
  const formatted = Number.isInteger(size) ? size.toString() : size.toFixed(1);
  return `${formatted} ${SIZE_UNITS[unitIndex]}`;
}

/**
 * Map a MIME type to a short, human-friendly label.
 * Returns "File" for anything unrecognised — never exposes raw MIME strings
 * to end-users.
 */
const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "Image",
  "image/jpeg": "Image",
  "image/gif": "Image",
  "image/webp": "Image",
  "text/plain": "Text",
  "text/html": "HTML",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Spreadsheet",
};

export function getSafeFileType(mimeType: string): string {
  return MIME_LABELS[mimeType] ?? "File";
}

/**
 * Determine whether a URL is safe to render as an active link.
 *
 * Safety rules:
 *  - Reject missing / empty URLs.
 *  - Reject dangerous protocols (javascript:, data:, vbscript:).
 *  - Reject all external http / https URLs (per SIG-004 requirement).
 *  - Only allow relative paths (internal navigation).
 */
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"];

export function isSafeUrl(url?: string): boolean {
  if (!url || url.trim() === "") return false;

  const lower = url.trim().toLowerCase();

  // Block dangerous protocols
  if (DANGEROUS_PROTOCOLS.some((proto) => lower.startsWith(proto))) return false;

  // Block all external URLs
  if (lower.startsWith("http://") || lower.startsWith("https://")) return false;

  return true;
}
