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

const legacyCooperativeTypeMap: Record<string, CooperativeTypeValue | null> = {
  MOVIMIENTO_COOPERATIVO: "ORGANISMOS_CENTRALES",
  TIPOS_DIVERSOS: null,
};

/** Normaliza valores heredados guardados en payloads JSON antes del cambio de enum. */
export function normalizeCooperativeTypeValues(rawValues: unknown): CooperativeTypeValue[] {
  if (!Array.isArray(rawValues)) {
    return [];
  }

  const unique = new Set<CooperativeTypeValue>();

  for (const rawValue of rawValues) {
    if (typeof rawValue !== "string") {
      continue;
    }

    if (cooperativeTypeValues.includes(rawValue as CooperativeTypeValue)) {
      unique.add(rawValue as CooperativeTypeValue);
      continue;
    }

    const mapped = legacyCooperativeTypeMap[rawValue];
    if (mapped) {
      unique.add(mapped);
    }
  }

  return Array.from(unique);
}

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
