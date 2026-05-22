import { z } from "zod";

export const richTextPayloadSchema = z.object({
  html: z.string().trim().max(12000),
  text: z.string().trim().max(4000),
});

export function sanitizeBasicHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/ on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}
