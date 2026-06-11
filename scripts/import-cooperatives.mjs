import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { ContactType, CooperativeStatus, PrismaClient, ReviewStatus } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

const REQUIRED_HEADERS = [
  "categoria",
  "nombre",
  "email",
  "telefono",
  "website",
  "social_media",
  "direccion_fisica",
  "pueblo",
  "clasificacion",
  "descripcion",
  "ano_incorporacion",
  "logo_url",
];

const COOPERATIVE_TYPES = new Set([
  "TRABAJO_ASOCIADO",
  "CONSUMIDORES_USUARIOS",
  "VIVIENDA",
  "ENERGIA",
]);

const DEFAULT_TYPE_MAP = {
  "trabajo asociado": "TRABAJO_ASOCIADO",
  "trabajo-asociado": "TRABAJO_ASOCIADO",
  trabajo: "TRABAJO_ASOCIADO",
  "consumidores usuarios": "CONSUMIDORES_USUARIOS",
  consumidores: "CONSUMIDORES_USUARIOS",
  usuarios: "CONSUMIDORES_USUARIOS",
  consumo: "CONSUMIDORES_USUARIOS",
  vivienda: "VIVIENDA",
  energia: "ENERGIA",
  energetica: "ENERGIA",
};

const DEFAULT_SOCIAL_PLATFORMS = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  x: "https://x.com/",
  twitter: "https://x.com/",
  linkedin: "https://www.linkedin.com/in/",
};

function printUsage(exitCode, message = null) {
  if (message) {
    console.error(`Error: ${message}`);
  }

  console.info("Uso:");
  console.info(
    "  node scripts/import-cooperatives.mjs --file ./data/cooperativas.csv [--mode dry-run|commit] [--config ./scripts/cooperative-import-mapping.json] [--batch-size 50] [--delimiter ,] [--report ./reports/import.json]"
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    mode: "dry-run",
    batchSize: 50,
    delimiter: ",",
    config: path.resolve("scripts/cooperative-import-mapping.json"),
    report: null,
    file: null,
    skipInvalidMunicipality: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--mode") {
      args.mode = String(argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    if (token === "--file") {
      args.file = path.resolve(String(argv[index + 1] ?? "").trim());
      index += 1;
      continue;
    }

    if (token === "--config") {
      args.config = path.resolve(String(argv[index + 1] ?? "").trim());
      index += 1;
      continue;
    }

    if (token === "--batch-size") {
      args.batchSize = Number.parseInt(String(argv[index + 1] ?? "50"), 10);
      index += 1;
      continue;
    }

    if (token === "--delimiter") {
      args.delimiter = String(argv[index + 1] ?? ",");
      index += 1;
      continue;
    }

    if (token === "--report") {
      args.report = path.resolve(String(argv[index + 1] ?? "").trim());
      index += 1;
      continue;
    }

    if (token === "--skip-invalid-municipality") {
      args.skipInvalidMunicipality = true;
      continue;
    }

    if (token === "--no-skip-invalid-municipality") {
      args.skipInvalidMunicipality = false;
      continue;
    }

    if (token === "--help" || token === "-h") {
      printUsage(0);
    }
  }

  if (!args.file) {
    printUsage(1, "Falta --file con la ruta al CSV.");
  }

  if (args.mode !== "dry-run" && args.mode !== "commit") {
    printUsage(1, "--mode debe ser dry-run o commit.");
  }

  if (!Number.isInteger(args.batchSize) || args.batchSize <= 0) {
    printUsage(1, "--batch-size debe ser un entero positivo.");
  }

  return args;
}

function normalizeKey(rawValue) {
  return String(rawValue ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toSlug(rawValue) {
  return String(rawValue ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function splitMulti(rawValue) {
  if (!rawValue || typeof rawValue !== "string") {
    return [];
  }

  return rawValue
    .split(/[;|]/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function readConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`No existe el archivo de config: ${configPath}`);
  }

  const rawConfig = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(rawConfig);

  return {
    categoryMap: normalizeMapping(parsed.categoryMap ?? {}),
    classificationMap: normalizeMapping(parsed.classificationMap ?? {}),
    municipalityMap: normalizeMunicipalityMap(parsed.municipalityMap ?? {}),
    socialPlatforms: {
      ...DEFAULT_SOCIAL_PLATFORMS,
      ...normalizeSocialMap(parsed.socialPlatforms ?? {}),
    },
  };
}

function normalizeMapping(inputMap) {
  const result = {};
  for (const [key, value] of Object.entries(inputMap)) {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
      continue;
    }

    const normalizedValue = String(value ?? "").trim().replace(/-/g, "_").toUpperCase();
    result[normalizedKey] = normalizedValue;
  }

  return result;
}

function normalizeMunicipalityMap(inputMap) {
  const result = {};
  for (const [key, value] of Object.entries(inputMap)) {
    const normalizedKey = normalizeKey(key);
    const normalizedValue = String(value ?? "").trim();

    if (!normalizedKey || !normalizedValue) {
      continue;
    }

    result[normalizedKey] = normalizedValue;
  }

  return result;
}

function normalizeSocialMap(inputMap) {
  const result = {};
  for (const [key, value] of Object.entries(inputMap)) {
    const normalizedKey = normalizeKey(key);
    const normalizedValue = String(value ?? "").trim();
    if (!normalizedKey || !normalizedValue) {
      continue;
    }

    result[normalizedKey] = normalizedValue;
  }

  return result;
}

function parseCsv(filePath, delimiter) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe el archivo CSV: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");

  const rows = parse(raw, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    delimiter,
    trim: true,
  });

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("El CSV no contiene filas de datos.");
  }

  const headers = Object.keys(rows[0]).map((header) => String(header).trim());
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length > 0) {
    throw new Error(`Faltan encabezados requeridos: ${missing.join(", ")}`);
  }

  return rows;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toUrl(value) {
  if (!value) {
    return null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.startsWith("www.") || /\.[a-z]{2,}(?:\/|$)/i.test(trimmed)
      ? `https://${trimmed}`
      : null;

  if (!withProtocol) {
    return null;
  }

  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

function normalizePhone(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\s+/g, " ");
}

function resolveCooperativeTypes(row, config) {
  const unknownTokens = [];
  const resolved = new Set();
  const typeMap = {
    ...DEFAULT_TYPE_MAP,
    ...config.categoryMap,
    ...config.classificationMap,
  };

  const sourceTokens = [...splitMulti(row.categoria), ...splitMulti(row.clasificacion)];

  for (const token of sourceTokens) {
    const normalizedToken = normalizeKey(token);
    if (!normalizedToken) {
      continue;
    }

    const mappedValue = String(typeMap[normalizedToken] ?? "").replace(/-/g, "_").toUpperCase();
    if (COOPERATIVE_TYPES.has(mappedValue)) {
      resolved.add(mappedValue);
      continue;
    }

    unknownTokens.push(token);
  }

  return {
    cooperativeTypes: Array.from(resolved),
    unknownTokens,
  };
}

function resolveMunicipalityCode(rawPueblo, config, municipalityCodeSet, municipalityByName) {
  const trimmed = String(rawPueblo ?? "").trim();
  if (!trimmed) {
    return null;
  }

  if (municipalityCodeSet.has(trimmed)) {
    return trimmed;
  }

  const normalized = normalizeKey(trimmed);
  const mapped = config.municipalityMap[normalized];
  if (mapped && municipalityCodeSet.has(mapped)) {
    return mapped;
  }

  return municipalityByName.get(normalized) ?? null;
}

function parseSocialMedia(rawValue, socialPlatforms) {
  const entries = splitMulti(rawValue);
  const contacts = [];
  const warnings = [];

  for (const entry of entries) {
    const normalized = entry.trim();
    const lower = normalizeKey(normalized);

    const isWhatsapp =
      /wa\.me|whatsapp|api\.whatsapp/i.test(normalized) ||
      /^\+?[0-9()\s-]{7,}$/.test(normalized);

    if (isWhatsapp) {
      const digits = normalized.replace(/[^0-9]/g, "");
      if (digits.length >= 7 && !/wa\.me|whatsapp|api\.whatsapp/i.test(normalized)) {
        contacts.push({ type: ContactType.WHATSAPP, value: `https://wa.me/${digits}` });
        continue;
      }

      const url = toUrl(normalized);
      if (url) {
        contacts.push({ type: ContactType.WHATSAPP, value: url });
        continue;
      }

      warnings.push(`social_media invalido para WhatsApp: ${entry}`);
      continue;
    }

    const url = toUrl(normalized);
    if (url) {
      contacts.push({ type: ContactType.WEBSITE, value: url });
      continue;
    }

    const socialHint = Object.keys(socialPlatforms).find((platform) => lower.includes(platform));
    if (socialHint) {
      const candidate = normalized.replace(/^[^:@]+[:\s-]*/i, "").trim();
      const handle = candidate.startsWith("@") ? candidate.slice(1) : candidate;

      if (handle) {
        contacts.push({ type: ContactType.WEBSITE, value: `${socialPlatforms[socialHint]}${handle}` });
        continue;
      }
    }

    warnings.push(`social_media no reconocido: ${entry}`);
  }

  return { contacts, warnings };
}

function buildContacts(row, socialPlatforms) {
  const contacts = [];
  const warnings = [];

  for (const email of splitMulti(row.email)) {
    if (!isValidEmail(email)) {
      warnings.push(`email invalido: ${email}`);
      continue;
    }
    contacts.push({ type: ContactType.EMAIL, value: email });
  }

  for (const phone of splitMulti(row.telefono)) {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      warnings.push(`telefono invalido: ${phone}`);
      continue;
    }
    contacts.push({ type: ContactType.PHONE, value: normalized });
  }

  for (const website of splitMulti(row.website)) {
    const normalized = toUrl(website);
    if (!normalized) {
      warnings.push(`website invalido: ${website}`);
      continue;
    }
    contacts.push({ type: ContactType.WEBSITE, value: normalized });
  }

  const socialResult = parseSocialMedia(row.social_media, socialPlatforms);
  contacts.push(...socialResult.contacts);
  warnings.push(...socialResult.warnings);

  const address = String(row.direccion_fisica ?? "").trim();
  if (address) {
    contacts.push({ type: ContactType.ADDRESS, value: address });
  }

  return {
    contacts: contacts.map((contact, index) => ({ ...contact, sortOrder: index })),
    warnings,
  };
}

function truncateDescription(rawDescription, warnings) {
  const value = String(rawDescription ?? "").trim();
  if (!value) {
    return null;
  }

  if (value.length <= 4000) {
    return value;
  }

  warnings.push("descripcion excede 4000 caracteres, se truncara");
  return value.slice(0, 4000);
}

function buildReportPath(customPath) {
  if (customPath) {
    return customPath;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve("reports", `cooperatives-import-${stamp}.json`);
}

function ensureDirectoryForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function loadMunicipalityMaps() {
  const municipalities = await prisma.municipality.findMany({
    select: { code: true, name: true },
  });

  return {
    municipalityCodeSet: new Set(municipalities.map((item) => item.code)),
    municipalityByName: new Map(municipalities.map((item) => [normalizeKey(item.name), item.code])),
  };
}

async function loadExistingSlugs() {
  const cooperatives = await prisma.cooperative.findMany({ select: { slug: true } });
  return new Set(cooperatives.map((item) => item.slug));
}

function buildDataRecord(row, context) {
  const {
    config,
    municipalityCodeSet,
    municipalityByName,
    existingSlugs,
    fileSlugs,
    skipInvalidMunicipality,
  } = context;

  const errors = [];
  const warnings = [];

  const name = String(row.nombre ?? "").trim();
  if (name.length < 2) {
    errors.push("nombre requerido (min 2 caracteres)");
  }

  const slug = toSlug(name);
  if (!slug) {
    errors.push("no se pudo generar slug desde nombre");
  }

  const municipalityCode = resolveMunicipalityCode(row.pueblo, config, municipalityCodeSet, municipalityByName);
  let skipByMunicipality = false;
  if (!municipalityCode) {
    if (skipInvalidMunicipality) {
      skipByMunicipality = true;
    } else {
      errors.push(`municipio no mapeado o invalido: ${String(row.pueblo ?? "")}`);
    }
  }

  const typeResolution = resolveCooperativeTypes(row, config);
  if (typeResolution.cooperativeTypes.length === 0) {
    errors.push("sin cooperativeTypes validos (categoria/clasificacion)");
  }

  if (typeResolution.unknownTokens.length > 0) {
    errors.push(`categoria/clasificacion no mapeada: ${typeResolution.unknownTokens.join(" | ")}`);
  }

  const duplicate = Boolean(slug) && (existingSlugs.has(slug) || fileSlugs.has(slug));
  if (!duplicate && slug) {
    fileSlugs.add(slug);
  }

  const descriptionText = truncateDescription(row.descripcion, warnings);
  const contactsResult = buildContacts(row, config.socialPlatforms);
  warnings.push(...contactsResult.warnings);

  const ano = String(row.ano_incorporacion ?? "").trim();
  if (ano) {
    warnings.push("ano_incorporacion presente pero no se guarda en schema actual");
  }

  const logo = String(row.logo_url ?? "").trim();
  if (logo) {
    warnings.push("logo_url presente pero no se carga en esta fase");
  }

  return {
    name,
    slug,
    municipalityCode,
    cooperativeTypes: typeResolution.cooperativeTypes,
    descriptionText,
    contacts: contactsResult.contacts,
    duplicate,
    skipByMunicipality,
    errors,
    warnings,
  };
}

function summarizeResults(context) {
  const {
    mode,
    rows,
    preparedRows,
    skippedDuplicates,
    skippedByMunicipality,
    rowsWithErrors,
    warnings,
    insertedCount,
  } = context;

  console.info("-");
  console.info("Resumen de importacion");
  console.info(`Modo: ${mode}`);
  console.info(`Filas leidas: ${rows.length}`);
  console.info(`Filas validas: ${preparedRows.length}`);
  console.info(`Duplicadas (skip): ${skippedDuplicates.length}`);
  console.info(`Sin municipio valido (skip): ${skippedByMunicipality.length}`);
  console.info(`Filas con error: ${rowsWithErrors.length}`);
  console.info(`Warnings: ${warnings.length}`);
  if (mode === "commit") {
    console.info(`Filas insertadas: ${insertedCount}`);
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const config = readConfig(args.config);
  const rows = parseCsv(args.file, args.delimiter);
  const reportPath = buildReportPath(args.report);

  const [{ municipalityCodeSet, municipalityByName }, existingSlugs] = await Promise.all([
    loadMunicipalityMaps(),
    loadExistingSlugs(),
  ]);

  const fileSlugs = new Set();
  const preparedRows = [];
  const skippedDuplicates = [];
  const skippedByMunicipality = [];
  const rowsWithErrors = [];
  const warnings = [];

  rows.forEach((row, index) => {
    const lineNumber = index + 2;
    const parsed = buildDataRecord(row, {
      config,
      municipalityCodeSet,
      municipalityByName,
      existingSlugs,
      fileSlugs,
      skipInvalidMunicipality: args.skipInvalidMunicipality,
    });

    parsed.warnings.forEach((message) => warnings.push({ lineNumber, message }));

    if (parsed.duplicate) {
      skippedDuplicates.push({ lineNumber, slug: parsed.slug, name: parsed.name });
      return;
    }

    if (parsed.skipByMunicipality) {
      skippedByMunicipality.push({
        lineNumber,
        name: parsed.name,
        pueblo: String(row.pueblo ?? "").trim(),
        reason: "municipio no mapeado o invalido",
      });
      return;
    }

    if (parsed.errors.length > 0) {
      rowsWithErrors.push({ lineNumber, name: parsed.name, slug: parsed.slug, errors: parsed.errors });
      return;
    }

    preparedRows.push({
      lineNumber,
      name: parsed.name,
      slug: parsed.slug,
      municipalityCode: parsed.municipalityCode,
      cooperativeTypes: parsed.cooperativeTypes,
      descriptionText: parsed.descriptionText,
      contacts: parsed.contacts,
    });
  });

  let insertedCount = 0;

  if (args.mode === "commit" && preparedRows.length > 0) {
    for (let start = 0; start < preparedRows.length; start += args.batchSize) {
      const batch = preparedRows.slice(start, start + args.batchSize);
      await prisma.$transaction(
        batch.map((item) =>
          prisma.cooperative.create({
            data: {
              name: item.name,
              slug: item.slug,
              municipalityCode: item.municipalityCode,
              descriptionText: item.descriptionText,
              cooperativeTypes: item.cooperativeTypes,
              status: CooperativeStatus.PUBLISHED,
              reviewStatus: ReviewStatus.APPROVED,
              publishedAt: new Date(),
              contacts: item.contacts.length > 0 ? { create: item.contacts } : undefined,
            },
          })
        )
      );

      insertedCount += batch.length;
      console.info(`Insertadas ${insertedCount}/${preparedRows.length} cooperativas`);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: args.mode,
    sourceFile: args.file,
    configFile: args.config,
    totalRows: rows.length,
    validRows: preparedRows.length,
    insertedRows: insertedCount,
    skippedDuplicatesCount: skippedDuplicates.length,
    skippedByMunicipalityCount: skippedByMunicipality.length,
    errorsCount: rowsWithErrors.length,
    warningsCount: warnings.length,
    skippedDuplicates,
    skippedByMunicipality,
    rowsWithErrors,
    warnings,
  };

  ensureDirectoryForFile(reportPath);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  summarizeResults({
    mode: args.mode,
    rows,
    preparedRows,
    skippedDuplicates,
    skippedByMunicipality,
    rowsWithErrors,
    warnings,
    insertedCount,
  });

  console.info(`Reporte escrito en: ${reportPath}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });