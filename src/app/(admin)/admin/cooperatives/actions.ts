"use server";

import { CooperativeStatus, ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { parseTagListInput } from "@/lib/cooperative-taxonomy";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { normalizeRichTextValue, richTextPayloadSchema } from "@/lib/validators/rich-text";
import { cooperativeCreateSchema, toSlug } from "@/lib/validators/cooperative";

export type CooperativeActionState = {
  ok: boolean;
  message: string;
};

export type CooperativeMediaActionState = {
  ok: boolean;
  message: string;
};

const MB = 1024 * 1024;
const LOGO_MAX_BYTES = 2 * MB;
const GALLERY_MAX_BYTES = 5 * MB;
const MAX_GALLERY_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseFormFile(value: FormDataEntryValue | null): File | null {
  if (!(value instanceof File)) {
    return null;
  }

  if (value.size <= 0) {
    return null;
  }

  return value;
}

export async function createCooperativeAction(
  _previousState: CooperativeActionState,
  formData: FormData
): Promise<CooperativeActionState> {
  await requirePlatformAdmin();

  const parsed = cooperativeCreateSchema.safeParse({
    name: formData.get("name"),
    municipalityCode: formData.get("municipalityCode"),
    foundedYear: formData.get("foundedYear"),
    slogan: formData.get("slogan"),
    descriptionText: formData.get("descriptionText"),
    cooperativeTypes: formData.getAll("cooperativeTypes"),
    tags: parseTagListInput(formData.get("tags")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const slugBase = toSlug(parsed.data.name);

  if (!slugBase) {
    return {
      ok: false,
      message: "No fue posible generar un slug válido para la cooperativa.",
    };
  }

  const existing = await db.cooperative.findUnique({
    where: { slug: slugBase },
    select: { id: true },
  });

  const finalSlug = existing ? `${slugBase}-${Date.now()}` : slugBase;

  await db.cooperative.create({
    data: {
      name: parsed.data.name,
      slug: finalSlug,
      municipalityCode: parsed.data.municipalityCode,
      foundedYear: parsed.data.foundedYear ?? null,
      slogan: parsed.data.slogan || null,
      descriptionText: parsed.data.descriptionText || null,
      cooperativeTypes: parsed.data.cooperativeTypes,
      tags: parsed.data.tags,
      status: CooperativeStatus.DRAFT,
      reviewStatus: ReviewStatus.PENDING,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/cooperatives");

  return {
    ok: true,
    message: "Cooperativa creada en estado borrador.",
  };
}

export async function updateCooperativeByAdminAction(
  _previousState: CooperativeActionState,
  formData: FormData
): Promise<CooperativeActionState> {
  const actor = await requirePlatformAdmin();

  const cooperativeId = String(formData.get("cooperativeId") ?? "").trim();
  if (!cooperativeId) {
    return { ok: false, message: "Cooperativa inválida." };
  }

  const parsed = cooperativeCreateSchema.safeParse({
    name: formData.get("name"),
    municipalityCode: formData.get("municipalityCode"),
    foundedYear: formData.get("foundedYear"),
    slogan: formData.get("slogan"),
    descriptionText: formData.get("descriptionText"),
    cooperativeTypes: formData.getAll("cooperativeTypes"),
    tags: parseTagListInput(formData.get("tags")),
  });

  const parsedRich = richTextPayloadSchema.safeParse({
    html: formData.get("descriptionRichHtml") ?? "",
    text: formData.get("descriptionRichText") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (!parsedRich.success) {
    return {
      ok: false,
      message: parsedRich.error.issues[0]?.message ?? "Descripción enriquecida inválida.",
    };
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeId },
    select: { id: true, slug: true },
  });

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  await db.cooperative.update({
    where: { id: cooperative.id },
    data: {
      name: parsed.data.name,
      municipalityCode: parsed.data.municipalityCode,
      foundedYear: parsed.data.foundedYear ?? null,
      slogan: parsed.data.slogan || null,
      descriptionText: parsed.data.descriptionText || null,
      cooperativeTypes: parsed.data.cooperativeTypes,
      tags: parsed.data.tags,
      descriptionRich: normalizeRichTextValue(parsedRich.data),
      reviewStatus: ReviewStatus.APPROVED,
      updatedById: actor.userId,
    },
  });

  revalidatePath(`/admin/cooperatives/${cooperative.id}`);
  revalidatePath("/admin/cooperatives");
  revalidatePath("/cooperativas");
  revalidatePath(`/cooperativas/${cooperative.slug}`);

  return {
    ok: true,
    message: "Cooperativa actualizada exitosamente.",
  };
}

export async function togglePublishCooperativeAction(id: string): Promise<void> {
  await requirePlatformAdmin();

  const cooperative = await db.cooperative.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!cooperative) {
    throw new Error("Cooperativa no encontrada");
  }

  const nextStatus =
    cooperative.status === CooperativeStatus.PUBLISHED
      ? CooperativeStatus.UNPUBLISHED
      : CooperativeStatus.PUBLISHED;

  await db.cooperative.update({
    where: { id },
    data: {
      status: nextStatus,
      reviewStatus: ReviewStatus.APPROVED,
      publishedAt: nextStatus === CooperativeStatus.PUBLISHED ? new Date() : null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/cooperatives");
}

export async function deleteCooperativeByPlatformAction(cooperativeId: string): Promise<void> {
  await requirePlatformAdmin();

  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeId },
    select: {
      id: true,
      logoUrl: true,
      gallery: {
        select: { imageUrl: true },
      },
    },
  });

  if (!cooperative) {
    throw new Error("Cooperativa no encontrada.");
  }

  const publicIds = [
    cooperative.logoUrl ? extractCloudinaryPublicIdFromUrl(cooperative.logoUrl) : null,
    ...cooperative.gallery.map((image) => extractCloudinaryPublicIdFromUrl(image.imageUrl)),
  ].filter((value): value is string => Boolean(value));

  await db.cooperative.delete({ where: { id: cooperative.id } });

  await Promise.all(publicIds.map((publicId) => destroyCloudinaryImage(publicId).catch(() => undefined)));

  revalidatePath("/admin");
  revalidatePath("/admin/cooperatives");
}

export async function uploadCooperativeLogoByAdminAction(
  _previousState: CooperativeMediaActionState,
  formData: FormData
): Promise<CooperativeMediaActionState> {
  const actor = await requirePlatformAdmin();
  const cooperativeId = String(formData.get("cooperativeId") ?? "").trim();
  const file = parseFormFile(formData.get("logoFile"));

  if (!cooperativeId) {
    return { ok: false, message: "Cooperativa inválida." };
  }

  if (!file) {
    return { ok: false, message: "Selecciona un archivo para el logo." };
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeId },
    select: { id: true, logoUrl: true },
  });

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  try {
    const uploaded = await uploadImageToCloudinary(file, {
      folder: `cooperatives/${cooperative.id}/logo`,
      maxBytes: LOGO_MAX_BYTES,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    });

    await db.cooperative.update({
      where: { id: cooperative.id },
      data: {
        logoUrl: uploaded.secureUrl,
        updatedById: actor.userId,
      },
    });

    const previousPublicId = cooperative.logoUrl
      ? extractCloudinaryPublicIdFromUrl(cooperative.logoUrl)
      : null;

    if (previousPublicId) {
      await destroyCloudinaryImage(previousPublicId).catch(() => undefined);
    }

    revalidatePath(`/admin/cooperatives/${cooperative.id}`);
    revalidatePath("/admin/cooperatives");

    return { ok: true, message: "Logo actualizado." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir el logo.",
    };
  }
}

export async function removeCooperativeLogoByAdminAction(formData: FormData): Promise<void> {
  const actor = await requirePlatformAdmin();
  const cooperativeId = String(formData.get("cooperativeId") ?? "").trim();

  if (!cooperativeId) {
    throw new Error("Cooperativa inválida.");
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeId },
    select: { id: true, logoUrl: true },
  });

  if (!cooperative) {
    throw new Error("Cooperativa no encontrada.");
  }

  await db.cooperative.update({
    where: { id: cooperative.id },
    data: {
      logoUrl: null,
      updatedById: actor.userId,
    },
  });

  const previousPublicId = cooperative.logoUrl ? extractCloudinaryPublicIdFromUrl(cooperative.logoUrl) : null;
  if (previousPublicId) {
    await destroyCloudinaryImage(previousPublicId).catch(() => undefined);
  }

  revalidatePath(`/admin/cooperatives/${cooperative.id}`);
  revalidatePath("/admin/cooperatives");
}

export async function addGalleryImageByAdminAction(
  _previousState: CooperativeMediaActionState,
  formData: FormData
): Promise<CooperativeMediaActionState> {
  await requirePlatformAdmin();
  const cooperativeId = String(formData.get("cooperativeId") ?? "").trim();
  const file = parseFormFile(formData.get("galleryFile"));
  const altText = toOptionalText(formData.get("altText"));

  if (!cooperativeId) {
    return { ok: false, message: "Cooperativa inválida." };
  }

  if (!file) {
    return { ok: false, message: "Selecciona una imagen para la galería." };
  }

  const [cooperative, existingCount, maxSortOrder] = await Promise.all([
    db.cooperative.findUnique({ where: { id: cooperativeId }, select: { id: true } }),
    db.galleryImage.count({ where: { cooperativeId } }),
    db.galleryImage.aggregate({ where: { cooperativeId }, _max: { sortOrder: true } }),
  ]);

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  if (existingCount >= MAX_GALLERY_IMAGES) {
    return { ok: false, message: "La galería permite un máximo de 5 fotos." };
  }

  try {
    const uploaded = await uploadImageToCloudinary(file, {
      folder: `cooperatives/${cooperative.id}/gallery`,
      maxBytes: GALLERY_MAX_BYTES,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    });

    await db.galleryImage.create({
      data: {
        cooperativeId,
        imageUrl: uploaded.secureUrl,
        altText,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        isPrimary: existingCount === 0,
      },
    });

    revalidatePath(`/admin/cooperatives/${cooperative.id}`);
    revalidatePath("/admin/cooperatives");

    return { ok: true, message: "Imagen agregada a la galería." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
    };
  }
}

export async function setPrimaryGalleryImageByAdminAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();
  const imageId = String(formData.get("imageId") ?? "").trim();

  if (!imageId) {
    throw new Error("Imagen inválida.");
  }

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
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

  revalidatePath(`/admin/cooperatives/${image.cooperativeId}`);
  revalidatePath("/admin/cooperatives");
}

export async function updateGalleryImageAltTextByAdminAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();
  const imageId = String(formData.get("imageId") ?? "").trim();
  const altTextRaw = formData.get("altText");
  const altText = typeof altTextRaw === "string" ? altTextRaw.trim() : "";

  if (!imageId) {
    throw new Error("Imagen inválida.");
  }

  if (altText.length > 200) {
    throw new Error("El texto alternativo no puede superar 200 caracteres.");
  }

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  await db.galleryImage.update({
    where: { id: image.id },
    data: { altText: altText || null },
  });

  revalidatePath(`/admin/cooperatives/${image.cooperativeId}`);
  revalidatePath("/admin/cooperatives");
}

export async function deleteGalleryImageByAdminAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();
  const imageId = String(formData.get("imageId") ?? "").trim();

  if (!imageId) {
    throw new Error("Imagen inválida.");
  }

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true, imageUrl: true, isPrimary: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
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

  revalidatePath(`/admin/cooperatives/${image.cooperativeId}`);
  revalidatePath("/admin/cooperatives");
}