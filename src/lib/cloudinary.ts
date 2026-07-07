import "server-only";

import crypto from "node:crypto";

type UploadImageOptions = {
  folder: string;
  maxBytes: number;
  allowedMimeTypes: string[];
};

type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
};

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const MIME_TYPE_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
};

function normalizeMimeType(value: string): string {
  const lower = value.trim().toLowerCase();
  if (!lower) {
    return "";
  }

  return MIME_TYPE_ALIASES[lower] ?? lower;
}

function inferMimeTypeFromFilename(fileName: string): string {
  const lower = fileName.trim().toLowerCase();
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) {
    return "image/jpeg";
  }

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  return "";
}

function getNormalizedFileMimeType(file: File): string {
  const fromBrowser = normalizeMimeType(file.type);
  if (fromBrowser) {
    return fromBrowser;
  }

  return inferMimeTypeFromFilename(file.name);
}

function getCloudinaryConfigFromUrl(value: string): CloudinaryConfig | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "cloudinary:") {
      return null;
    }

    const cloudName = parsed.hostname.trim();
    const apiKey = decodeURIComponent(parsed.username || "").trim();
    const apiSecret = decodeURIComponent(parsed.password || "").trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return null;
    }

    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

function getCloudinaryConfig(): CloudinaryConfig {
  const fromUrl = process.env.CLOUDINARY_URL?.trim();
  if (fromUrl) {
    const parsed = getCloudinaryConfigFromUrl(fromUrl);
    if (parsed) {
      return parsed;
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Falta configurar Cloudinary. Define CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET."
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string): string {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function extractCloudinaryPublicIdFromUrl(url: string): string | null {
  const uploadMarker = "/upload/";
  const markerIndex = url.indexOf(uploadMarker);
  if (markerIndex < 0) {
    return null;
  }

  const withoutQuery = url.split("?")[0] ?? url;
  let rest = withoutQuery.slice(markerIndex + uploadMarker.length);

  const versionMatch = rest.match(/\/v\d+\//);
  if (versionMatch?.index !== undefined) {
    rest = rest.slice(versionMatch.index + versionMatch[0].length);
  }

  return rest.replace(/\.[^/.]+$/, "") || null;
}

export async function uploadImageToCloudinary(
  file: File,
  options: UploadImageOptions
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const normalizedAllowedTypes = options.allowedMimeTypes.map((mimeType) => normalizeMimeType(mimeType));
  const fileMimeType = getNormalizedFileMimeType(file);

  if (file.size <= 0) {
    throw new Error("Selecciona un archivo de imagen.");
  }

  if (!fileMimeType || !normalizedAllowedTypes.includes(fileMimeType)) {
    throw new Error(
      `Formato no permitido${file.type ? ` (${file.type})` : ""}. Usa JPG, PNG o WEBP.`
    );
  }

  if (file.size > options.maxBytes) {
    throw new Error(`La imagen supera el tamaño permitido (${Math.round(options.maxBytes / 1024 / 1024)} MB).`);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ folder: options.folder, timestamp }, apiSecret);

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("folder", options.folder);
  body.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { secure_url?: string; public_id?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !payload?.secure_url || !payload.public_id) {
    throw new Error(payload?.error?.message || "No se pudo subir la imagen a Cloudinary.");
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
  };
}

export async function destroyCloudinaryImage(publicId: string): Promise<void> {
  const normalized = publicId.trim();
  if (!normalized) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: normalized, timestamp }, apiSecret);

  const body = new URLSearchParams();
  body.set("public_id", normalized);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
    cache: "no-store",
  });
}
