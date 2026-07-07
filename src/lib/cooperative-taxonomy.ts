export const cooperativeTypeValues = [
  "AHORRO_CREDITO",
  "MOVIMIENTO_COOPERATIVO",
  "TIPOS_DIVERSOS",
  "TRABAJO_ASOCIADO",
  "CONSUMIDORES_USUARIOS",
  "VIVIENDA",
  "ENERGIA",
] as const;

export type CooperativeTypeValue = (typeof cooperativeTypeValues)[number];

export const cooperativeTypeLabels: Record<CooperativeTypeValue, string> = {
  AHORRO_CREDITO: "Ahorro y credito",
  MOVIMIENTO_COOPERATIVO: "Movimiento cooperativo",
  TIPOS_DIVERSOS: "Tipos diversos",
  TRABAJO_ASOCIADO: "Trabajo asociado",
  CONSUMIDORES_USUARIOS: "Consumidores/Usuarios",
  VIVIENDA: "Vivienda",
  ENERGIA: "Energia",
};

function normalizeTag(rawTag: string): string {
  return rawTag
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function parseTagListInput(rawValue: FormDataEntryValue | null): string[] {
  if (typeof rawValue !== "string") {
    return [];
  }

  const unique = new Set<string>();
  const parts = rawValue.split(/[,;\n]/g);

  for (const part of parts) {
    const normalized = normalizeTag(part);
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}
