import { z } from "zod";

export const richTextPayloadSchema = z.object({
  html: z.string().trim().max(12000),
  text: z.string().trim().max(4000),
});

export function normalizeRichTextValue(input: { html: string; text: string }): {
  html: string;
  text: string;
} {
  const normalizedText = input.text.trim();
  if (!normalizedText) {
    return { html: "", text: "" };
  }

  return {
    html: sanitizeBasicHtml(input.html),
    text: normalizedText,
  };
}

export function sanitizeBasicHtml(input: string): string {
  return input
    // Remove script tags and their entire content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    // Remove dangerous embedded-content and meta tags entirely
    .replace(/<\/?(iframe|object|embed|form|base|meta|link|style|applet|svg|math)[^>]*>/gi, "")
    // Remove ALL event handler attributes regardless of quote style
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Strip dangerous URL schemes from href/src/action attributes
    .replace(/(href|src|action)\s*=\s*["']?\s*(javascript|vbscript|data)\s*:/gi, "")
    // Catch any remaining bare dangerous scheme references
    .replace(/(javascript|vbscript)\s*:/gi, "");
}
