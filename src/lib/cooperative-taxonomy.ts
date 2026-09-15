export const cooperativeTypeValues = [
  "AHORRO_CREDITO",
  "ORGANISMOS_CENTRALES",
  "TRABAJO_ASOCIADO",
  "CONSUMIDORES_USUARIOS",
  "MIXTAS",
  "VIVIENDA",
  "ENERGIA",
  "SEGUROS",
  "JUVENILES",
] as const;

export type CooperativeTypeValue = (typeof cooperativeTypeValues)[number];

export const cooperativeTypeLabels: Record<CooperativeTypeValue, string> = {
  AHORRO_CREDITO: "Ahorro y credito",
  ORGANISMOS_CENTRALES: "Organismos centrales",
  TRABAJO_ASOCIADO: "Trabajo asociado",
  CONSUMIDORES_USUARIOS: "Consumidores/Usuarios",
  MIXTAS: "Mixtas",
  VIVIENDA: "Vivienda",
  ENERGIA: "Energia",
  SEGUROS: "Seguros",
  JUVENILES: "Juveniles",
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
