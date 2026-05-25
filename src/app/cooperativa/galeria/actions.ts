"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";
import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

const MAX_GALLERY_IMAGES = 5;
const GALLERY_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createGalleryImageSchema = z.object({
  cooperativeId: z.string().min(1),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
});

const updateGalleryImageAltSchema = z.object({
  imageId: z.string().min(1),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
});

function parseFormFile(value: FormDataEntryValue | null): File | null {
  if (!(value instanceof File)) {
    return null;
  }

  if (!value.name || value.size <= 0) {
    return null;
  }

  return value;
}

export async function createGalleryImageAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = createGalleryImageSchema.safeParse({
    cooperativeId: formData.get("cooperativeId"),
    altText: formData.get("altText"),
  });
  const file = parseFormFile(formData.get("imageFile"));

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!file) {
    throw new Error("Selecciona una imagen para la galeria.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar la galeria de esta cooperativa.");
  }

  const totalImages = await db.galleryImage.count({
    where: { cooperativeId: parsed.data.cooperativeId },
  });

  if (totalImages >= MAX_GALLERY_IMAGES) {
    throw new Error("La galeria permite un maximo de 5 imagenes.");
  }

  const maxSortOrder = await db.galleryImage.aggregate({
    where: { cooperativeId: parsed.data.cooperativeId },
    _max: { sortOrder: true },
  });

  const uploaded = await uploadImageToCloudinary(file, {
    folder: `cooperatives/${parsed.data.cooperativeId}/gallery`,
    maxBytes: GALLERY_MAX_BYTES,
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
  });

  await db.galleryImage.create({
    data: {
      cooperativeId: parsed.data.cooperativeId,
      imageUrl: uploaded.secureUrl,
      altText: parsed.data.altText || null,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      isPrimary: totalImages === 0,
    },
  });

  revalidatePath("/cooperativa/galeria");
}

export async function updateGalleryImageAltTextAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = updateGalleryImageAltSchema.safeParse({
    imageId: formData.get("imageId"),
    altText: formData.get("altText"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const image = await db.galleryImage.findUnique({
    where: { id: parsed.data.imageId },
    select: { id: true, cooperativeId: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  if (!canMutateCooperative(actor, image.cooperativeId)) {
    throw new Error("No autorizado para actualizar esta imagen.");
  }

  await db.galleryImage.update({
    where: { id: image.id },
    data: { altText: parsed.data.altText || null },
  });

  revalidatePath("/cooperativa/galeria");
}

export async function deleteGalleryImageAction(imageId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true, imageUrl: true, isPrimary: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  if (!canMutateCooperative(actor, image.cooperativeId)) {
    throw new Error("No autorizado para eliminar esta imagen.");
  }

  await db.galleryImage.delete({ where: { id: image.id } });

  if (image.isPrimary) {
    const nextPrimary = await db.galleryImage.findFirst({
      where: { cooperativeId: image.cooperativeId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    });

    if (nextPrimary) {
      await db.galleryImage.update({
        where: { id: nextPrimary.id },
        data: { isPrimary: true },
      });
    }
  }

  const publicId = extractCloudinaryPublicIdFromUrl(image.imageUrl);
  if (publicId) {
    await destroyCloudinaryImage(publicId).catch(() => undefined);
  }

  revalidatePath("/cooperativa/galeria");
}

export async function setPrimaryGalleryImageAction(imageId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  if (!canMutateCooperative(actor, image.cooperativeId)) {
    throw new Error("No autorizado para actualizar esta imagen.");
  }

  await db.$transaction([
    db.galleryImage.updateMany({
      where: { cooperativeId: image.cooperativeId, isPrimary: true },
      data: { isPrimary: false },
    }),
    db.galleryImage.update({
      where: { id: image.id },
      data: { isPrimary: true },
    }),
  ]);

  revalidatePath("/cooperativa/galeria");
}