import { z } from "zod";

import { cooperativeTypeValues } from "@/lib/cooperative-taxonomy";

const cooperativeTypeEnum = z.enum(cooperativeTypeValues);
const currentYear = new Date().getFullYear();

const foundedYearSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const numeric = Number.parseInt(trimmed, 10);
    return Number.isNaN(numeric) ? value : numeric;
  },
  z
    .number()
    .int("El año de fundación debe ser un número entero")
    .min(1700, "Ingresa un año de fundación válido")
    .max(currentYear, "El año de fundación no puede ser futuro")
    .optional(),
);

export const cooperativeCreateSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  municipalityCode: z.string().trim().min(2, "El municipio es obligatorio"),
  foundedYear: foundedYearSchema,
  slogan: z.string().trim().max(180).optional().or(z.literal("")),
  descriptionText: z.string().trim().max(4000).optional().or(z.literal("")),
  cooperativeTypes: z
    .array(cooperativeTypeEnum)
    .min(1, "Selecciona al menos un tipo de cooperativa"),
  tags: z
    .array(z.string().trim().min(1).max(40, "Cada palabra clave debe tener maximo 40 caracteres"))
    .max(20, "Puedes ingresar maximo 20 palabras clave")
    .default([]),
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