"use server";

import { revalidatePath } from "next/cache";
import { imageSize } from "image-size";
import { z } from "zod";

import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { BANNER_SLOT_CONFIG, BANNER_SLOTS, type BannerSlotKey } from "@/lib/banner-config";
import { db } from "@/lib/db";

const MB = 1024 * 1024;
const BANNER_MAX_BYTES = 5 * MB;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createBannerSchema = z.object({
  slot: z.enum(BANNER_SLOTS),
  title: z.string().trim().min(2, "El título es obligatorio.").max(120, "Máximo 120 caracteres."),
  targetUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\//i.test(value), {
      message: "La URL debe comenzar con http:// o https://",
    }),
});

const updateBannerDetailsSchema = z.object({
  bannerId: z.string().trim().min(1, "Banner inválido."),
  title: z.string().trim().min(2, "El título es obligatorio.").max(120, "Máximo 120 caracteres."),
  targetUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\//i.test(value), {
      message: "La URL debe comenzar con http:// o https://",
    }),
});

export type BannerActionState = {
  ok: boolean;
  message: string;
};

function parseFormFile(value: FormDataEntryValue | null): File | null {
  if (!(value instanceof File)) {
    return null;
  }

  if (!value.name || value.size <= 0) {
    return null;
  }

  return value;
}

async function validateBannerDimensions(file: File, slot: BannerSlotKey): Promise<void> {
  const config = BANNER_SLOT_CONFIG[slot];
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const dimensions = imageSize(fileBuffer);

  if (!dimensions.width || !dimensions.height) {
    throw new Error("No se pudo leer el tamaño de la imagen.");
  }

  if (dimensions.width < config.width || dimensions.height < config.height) {
    throw new Error(
      `Dimensiones insuficientes para ${config.label}. Mínimo recomendado: ${config.width}x${config.height}px.`
    );
  }

  const requiredRatio = config.width / config.height;
  const uploadedRatio = dimensions.width / dimensions.height;
  const ratioDelta = Math.abs(uploadedRatio - requiredRatio);

  if (ratioDelta > 0.03) {
    throw new Error(
      `Proporción inválida para ${config.label}. Usa una imagen ${config.width}:${config.height} (ej. ${config.width}x${config.height}px).`
    );
  }
}

export async function createBannerAction(
  _previousState: BannerActionState,
  formData: FormData
): Promise<BannerActionState> {
  const actor = await requirePlatformAdmin();

  const parsed = createBannerSchema.safeParse({
    slot: formData.get("slot"),
    title: formData.get("title"),
    targetUrl: formData.get("targetUrl"),
  });
  const file = parseFormFile(formData.get("imageFile"));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (!file) {
    return { ok: false, message: "Selecciona una imagen para el banner." };
  }

  const slot = parsed.data.slot;
  const slotConfig = BANNER_SLOT_CONFIG[slot];

  const countBySlot = await db.homeBanner.count({ where: { slot } });
  if (countBySlot >= slotConfig.maxImages) {
    return {
      ok: false,
      message: `El slot ${slotConfig.label} permite un máximo de ${slotConfig.maxImages} imágenes.`,
    };
  }

  try {
    await validateBannerDimensions(file, slot);

    const uploaded = await uploadImageToCloudinary(file, {
      folder: `banners/${slot.toLowerCase()}`,
      maxBytes: BANNER_MAX_BYTES,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    });

    const maxSortOrder = await db.homeBanner.aggregate({
      where: { slot },
      _max: { sortOrder: true },
    });

    await db.homeBanner.create({
      data: {
        slot,
        title: parsed.data.title,
        imageUrl: uploaded.secureUrl,
        targetUrl: parsed.data.targetUrl || null,
        isActive: true,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        createdById: actor.userId,
        updatedById: actor.userId,
      },
    });

    revalidatePath("/admin/banners");

    return { ok: true, message: "Banner creado exitosamente." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo crear el banner.",
    };
  }
}

export async function toggleBannerActiveAction(bannerId: string): Promise<void> {
  await requirePlatformAdmin();

  const banner = await db.homeBanner.findUnique({
    where: { id: bannerId },
    select: { id: true, isActive: true },
  });

  if (!banner) {
    throw new Error("Banner no encontrado.");
  }

  await db.homeBanner.update({
    where: { id: banner.id },
    data: { isActive: !banner.isActive },
  });

  revalidatePath("/admin/banners");
}

export async function updateBannerTargetUrlAction(formData: FormData): Promise<void> {
  const actor = await requirePlatformAdmin();

  const parsed = updateBannerDetailsSchema.safeParse({
    bannerId: formData.get("bannerId"),
    title: formData.get("title"),
    targetUrl: formData.get("targetUrl"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const banner = await db.homeBanner.findUnique({
    where: { id: parsed.data.bannerId },
    select: { id: true },
  });

  if (!banner) {
    throw new Error("Banner no encontrado.");
  }

  await db.homeBanner.update({
    where: { id: banner.id },
    data: {
      title: parsed.data.title,
      targetUrl: parsed.data.targetUrl || null,
      updatedById: actor.userId,
    },
  });

  revalidatePath("/admin/banners");
}

export async function deleteBannerAction(bannerId: string): Promise<void> {
  await requirePlatformAdmin();

  const banner = await db.homeBanner.findUnique({
    where: { id: bannerId },
    select: { id: true, imageUrl: true },
  });

  if (!banner) {
    throw new Error("Banner no encontrado.");
  }

  await db.homeBanner.delete({ where: { id: banner.id } });

  const publicId = extractCloudinaryPublicIdFromUrl(banner.imageUrl);
  if (publicId) {
    await destroyCloudinaryImage(publicId).catch(() => undefined);
  }

  revalidatePath("/admin/banners");
}
