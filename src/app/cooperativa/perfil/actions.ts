"use server";

import { ChangeRequestStatus, ChangeSeverity, CooperativeType, ReviewStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { parseTagListInput } from "@/lib/cooperative-taxonomy";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";
import { sanitizeBasicHtml, richTextPayloadSchema } from "@/lib/validators/rich-text";
import { cooperativeCreateSchema } from "@/lib/validators/cooperative";

export type ProfileActionState = {
  ok: boolean;
  message: string;
};

const MB = 1024 * 1024;
const LOGO_MAX_BYTES = 2 * MB;
const GALLERY_MAX_BYTES = 5 * MB;
const MAX_GALLERY_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toOptionalValue(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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

  return value.size > 0 ? value : null;
}

function revalidateCooperativeMediaViews(cooperativeId: string): void {
  revalidatePath("/cooperativa/perfil");
  revalidatePath("/cooperativa/galeria");
  revalidatePath("/admin/cooperatives");
  revalidatePath(`/admin/cooperatives/${cooperativeId}`);
}

function areSameArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

export async function updateCooperativeProfileAction(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const actor = await requireCoopAdminOrPlatform();

  const cooperativeIdFromForm = toOptionalValue(formData.get("cooperativeId"));
  if (!cooperativeIdFromForm) {
    return { ok: false, message: "Cooperativa inválida." };
  }

  if (actor.role === UserRole.COOP_ADMIN && actor.cooperativeId !== cooperativeIdFromForm) {
    return { ok: false, message: "No puedes editar otra cooperativa." };
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeIdFromForm },
    select: {
      id: true,
      name: true,
      municipalityCode: true,
      foundedYear: true,
      slogan: true,
      descriptionText: true,
      descriptionRich: true,
      cooperativeTypes: true,
      tags: true,
    },
  });

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  const parsedCore = cooperativeCreateSchema.safeParse({
    name: formData.get("name"),
    municipalityCode: formData.get("municipalityCode"),
    foundedYear: formData.get("foundedYear"),
    slogan: formData.get("slogan"),
    descriptionText: formData.get("descriptionText"),
    cooperativeTypes: formData.getAll("cooperativeTypes"),
    tags: parseTagListInput(formData.get("tags")),
  });

  if (!parsedCore.success) {
    return {
      ok: false,
      message: parsedCore.error.issues[0]?.message ?? "Formulario inválido.",
    };
  }

  const parsedRich = richTextPayloadSchema.safeParse({
    html: formData.get("descriptionRichHtml") ?? "",
    text: formData.get("descriptionRichText") ?? "",
  });

  if (!parsedRich.success) {
    return {
      ok: false,
      message: parsedRich.error.issues[0]?.message ?? "Descripción enriquecida inválida.",
    };
  }

  const newData = {
    name: parsedCore.data.name,
    municipalityCode: parsedCore.data.municipalityCode,
    foundedYear: parsedCore.data.foundedYear ?? null,
    slogan: parsedCore.data.slogan || null,
    descriptionText: parsedCore.data.descriptionText || null,
    cooperativeTypes: parsedCore.data.cooperativeTypes,
    tags: parsedCore.data.tags,
    descriptionRich: {
      html: sanitizeBasicHtml(parsedRich.data.html),
      text: parsedRich.data.text,
    },
  };

  const isMajorChange =
    newData.name !== cooperative.name ||
    newData.municipalityCode !== cooperative.municipalityCode ||
    !areSameArray(newData.cooperativeTypes, cooperative.cooperativeTypes);

  if (actor.role === UserRole.PLATFORM_ADMIN || !isMajorChange) {
    await db.cooperative.update({
      where: { id: cooperative.id },
      data: {
        ...newData,
        reviewStatus: ReviewStatus.APPROVED,
        updatedById: actor.userId,
      },
    });

    await db.cooperativeChangeRequest.create({
      data: {
        cooperativeId: cooperative.id,
        requestedById: actor.userId,
        reviewedById: actor.role === UserRole.PLATFORM_ADMIN ? actor.userId : null,
        severity: isMajorChange ? ChangeSeverity.MAJOR : ChangeSeverity.MINOR,
        status:
          actor.role === UserRole.PLATFORM_ADMIN
            ? ChangeRequestStatus.APPROVED
            : ChangeRequestStatus.AUTO_PUBLISHED,
        payload: newData,
        notes:
          actor.role === UserRole.PLATFORM_ADMIN
            ? "Ajuste aplicado por administrador de plataforma"
            : "Cambio menor autopublicado",
        reviewedAt: actor.role === UserRole.PLATFORM_ADMIN ? new Date() : null,
      },
    });

    revalidatePath("/cooperativa/perfil");
    revalidatePath("/admin/cooperatives");

    return {
      ok: true,
      message:
        actor.role === UserRole.PLATFORM_ADMIN
          ? "Cambios aplicados inmediatamente."
          : "Cambios menores aplicados y publicados automáticamente.",
    };
  }

  await db.cooperativeChangeRequest.create({
    data: {
      cooperativeId: cooperative.id,
      requestedById: actor.userId,
      severity: ChangeSeverity.MAJOR,
      status: ChangeRequestStatus.PENDING,
      payload: newData,
      notes: "Cambio mayor enviado a revisión",
    },
  });

  await db.cooperative.update({
    where: { id: cooperative.id },
    data: {
      reviewStatus: ReviewStatus.PENDING,
      updatedById: actor.userId,
    },
  });

  revalidatePath("/cooperativa/perfil");
  revalidatePath("/admin/reviews");

  return {
    ok: true,
    message: "Cambio mayor enviado a aprobación de la plataforma.",
  };
}

export async function uploadCooperativeLogoAction(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const actor = await requireCoopAdminOrPlatform();
  const cooperativeId = toOptionalText(formData.get("cooperativeId"));
  const file = parseFormFile(formData.get("logoFile"));

  if (!cooperativeId) {
    return { ok: false, message: "Cooperativa invalida." };
  }

  if (!file) {
    return { ok: false, message: "Selecciona un archivo para el logo." };
  }

  if (!canMutateCooperative(actor, cooperativeId)) {
    return { ok: false, message: "No autorizado para editar esta cooperativa." };
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

    revalidateCooperativeMediaViews(cooperative.id);

    return { ok: true, message: "Logo actualizado." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir el logo.",
    };
  }
}

export async function removeCooperativeLogoAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  const cooperativeId = toOptionalText(formData.get("cooperativeId"));

  if (!cooperativeId) {
    throw new Error("Cooperativa invalida.");
  }

  if (!canMutateCooperative(actor, cooperativeId)) {
    throw new Error("No autorizado para editar esta cooperativa.");
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

  revalidateCooperativeMediaViews(cooperative.id);
}

export async function addCooperativeGalleryImageAction(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const actor = await requireCoopAdminOrPlatform();
  const cooperativeId = toOptionalText(formData.get("cooperativeId"));
  const file = parseFormFile(formData.get("galleryFile"));
  const altText = toOptionalText(formData.get("altText"));

  if (!cooperativeId) {
    return { ok: false, message: "Cooperativa invalida." };
  }

  if (!file) {
    return { ok: false, message: "Selecciona una imagen para la galeria." };
  }

  if (!canMutateCooperative(actor, cooperativeId)) {
    return { ok: false, message: "No autorizado para editar esta cooperativa." };
  }

  const [cooperative, totalImages, maxSortOrder] = await Promise.all([
    db.cooperative.findUnique({ where: { id: cooperativeId }, select: { id: true } }),
    db.galleryImage.count({ where: { cooperativeId } }),
    db.galleryImage.aggregate({ where: { cooperativeId }, _max: { sortOrder: true } }),
  ]);

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  if (totalImages >= MAX_GALLERY_IMAGES) {
    return { ok: false, message: "La galeria permite un maximo de 5 imagenes." };
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
        isPrimary: totalImages === 0,
      },
    });

    revalidateCooperativeMediaViews(cooperative.id);

    return { ok: true, message: "Imagen agregada a la galeria." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
    };
  }
}

export async function setPrimaryCooperativeGalleryImageAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  const imageId = toOptionalText(formData.get("imageId"));

  if (!imageId) {
    throw new Error("Imagen invalida.");
  }

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  if (!canMutateCooperative(actor, image.cooperativeId)) {
    throw new Error("No autorizado para editar esta cooperativa.");
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

  revalidateCooperativeMediaViews(image.cooperativeId);
}

export async function deleteCooperativeGalleryImageAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  const imageId = toOptionalText(formData.get("imageId"));

  if (!imageId) {
    throw new Error("Imagen invalida.");
  }

  const image = await db.galleryImage.findUnique({
    where: { id: imageId },
    select: { id: true, cooperativeId: true, imageUrl: true, isPrimary: true },
  });

  if (!image) {
    throw new Error("Imagen no encontrada.");
  }

  if (!canMutateCooperative(actor, image.cooperativeId)) {
    throw new Error("No autorizado para editar esta cooperativa.");
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

  revalidateCooperativeMediaViews(image.cooperativeId);
}

export async function reviewChangeRequestAction(
  requestId: string,
  decision: "approve" | "reject"
): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  if (actor.role !== UserRole.PLATFORM_ADMIN) {
    throw new Error("Solo plataforma puede revisar cambios.");
  }

  const request = await db.cooperativeChangeRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      cooperativeId: true,
      payload: true,
    },
  });

  if (!request || request.status !== ChangeRequestStatus.PENDING) {
    throw new Error("Solicitud inválida o ya procesada.");
  }

  if (decision === "approve") {
    const payload = request.payload as {
      name: string;
      municipalityCode: string;
      slogan: string | null;
      descriptionText: string | null;
      cooperativeTypes: string[];
      tags: string[];
      descriptionRich: { html: string; text: string };
    };

    await db.cooperative.update({
      where: { id: request.cooperativeId },
      data: {
        name: payload.name,
        municipalityCode: payload.municipalityCode,
        slogan: payload.slogan,
        descriptionText: payload.descriptionText,
        cooperativeTypes: payload.cooperativeTypes as CooperativeType[],
        tags: payload.tags,
        descriptionRich: payload.descriptionRich,
        reviewStatus: ReviewStatus.APPROVED,
        updatedById: actor.userId,
      },
    });

    await db.cooperativeChangeRequest.update({
      where: { id: request.id },
      data: {
        status: ChangeRequestStatus.APPROVED,
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    });
  } else {
    await db.cooperativeChangeRequest.update({
      where: { id: request.id },
      data: {
        status: ChangeRequestStatus.REJECTED,
        reviewedById: actor.userId,
        reviewedAt: new Date(),
        notes: "Cambio rechazado por plataforma",
      },
    });
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/cooperativa/perfil");
}
