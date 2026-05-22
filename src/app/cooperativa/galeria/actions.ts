"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

const createGalleryImageSchema = z.object({
  cooperativeId: z.string().min(1),
  imageUrl: z.string().trim().url("Debes ingresar una URL valida de imagen."),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function createGalleryImageAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = createGalleryImageSchema.safeParse({
    cooperativeId: formData.get("cooperativeId"),
    imageUrl: formData.get("imageUrl"),
    altText: formData.get("altText"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar la galeria de esta cooperativa.");
  }

  const maxSortOrder = await db.galleryImage.aggregate({
    where: { cooperativeId: parsed.data.cooperativeId },
    _max: { sortOrder: true },
  });

  await db.galleryImage.create({
    data: {
      cooperativeId: parsed.data.cooperativeId,
      imageUrl: parsed.data.imageUrl,
      altText: parsed.data.altText || null,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/cooperativa/galeria");
}

export async function deleteGalleryImageAction(imageId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  if (!canMutateCooperative(actor, image.cooperativeId)) {
    throw new Error("No autorizado para eliminar esta imagen.");
  }

  await db.galleryImage.delete({ where: { id: image.id } });
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