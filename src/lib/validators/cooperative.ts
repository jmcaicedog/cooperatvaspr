import { z } from "zod";

export const cooperativeCreateSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  municipalityCode: z.string().trim().min(2, "El municipio es obligatorio"),
  slogan: z.string().trim().max(180).optional().or(z.literal("")),
  descriptionText: z.string().trim().max(4000).optional().or(z.literal("")),
});

export function toSlug(rawValue: string): string {
  return rawValue
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}