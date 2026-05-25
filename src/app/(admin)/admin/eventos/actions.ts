"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sanitizeBasicHtml, richTextPayloadSchema } from "@/lib/validators/rich-text";

export type EventActionState = {
  ok: boolean;
  message: string;
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

const eventBaseSchema = z.object({
  title: z.string().trim().min(2, "El nombre es obligatorio").max(200),
  location: z.string().trim().min(1, "La ubicación es obligatoria").max(300),
  startsAt: z.string().min(1, "La fecha de inicio es obligatoria"),
  endsAt: z.string().optional().or(z.literal("")),
  infoUrl: z
    .string()
    .trim()
    .url("El enlace debe ser una URL válida")
    .optional()
    .or(z.literal("")),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDateTime(value: string | undefined | null): Date | null {
  if (!value || value.trim() === "") return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// ─── Acciones ─────────────────────────────────────────────────────────────────

export async function createEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const auth = await requirePlatformAdmin();

  const parsed = eventBaseSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || "",
    infoUrl: formData.get("infoUrl") || "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { title, location, startsAt, endsAt, infoUrl } = parsed.data;
  const startsAtDate = parseDateTime(startsAt);
  if (!startsAtDate) return { ok: false, message: "Fecha de inicio inválida" };
  const endsAtDate = parseDateTime(endsAt);

  await db.event.create({
    data: {
      title,
      location,
      startsAt: startsAtDate,
      endsAt: endsAtDate ?? undefined,
      infoUrl: infoUrl || null,
      createdById: auth.userId,
    },
  });

  revalidatePath("/admin/eventos");
  return { ok: true, message: "Evento creado" };
}

export async function updateEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const auth = await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const parsed = eventBaseSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || "",
    infoUrl: formData.get("infoUrl") || "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const richParsed = richTextPayloadSchema.safeParse({
    html: formData.get("descriptionHtml") ?? "",
    text: formData.get("descriptionText") ?? "",
  });

  if (!richParsed.success) {
    return { ok: false, message: "Descripción inválida" };
  }

  const { title, location, startsAt, endsAt, infoUrl } = parsed.data;
  const startsAtDate = parseDateTime(startsAt);
  if (!startsAtDate) return { ok: false, message: "Fecha de inicio inválida" };
  const endsAtDate = parseDateTime(endsAt);
  const descriptionHtml = sanitizeBasicHtml(richParsed.data.html);
  const descriptionText = richParsed.data.text;

  await db.event.update({
    where: { id },
    data: {
      title,
      location,
      startsAt: startsAtDate,
      endsAt: endsAtDate ?? null,
      infoUrl: infoUrl || null,
      descriptionHtml: descriptionHtml || null,
      descriptionText: descriptionText || null,
    },
  });

  revalidatePath("/admin/eventos");
  revalidatePath(`/admin/eventos/${id}`);
  return { ok: true, message: "Evento guardado" };
}

export async function togglePublishEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const auth = await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const event = await db.event.findUnique({ where: { id }, select: { isPublished: true } });
  if (!event) return { ok: false, message: "Evento no encontrado" };

  await db.event.update({
    where: { id },
    data: { isPublished: !event.isPublished },
  });

  revalidatePath("/admin/eventos");
  revalidatePath(`/admin/eventos/${id}`);
  return {
    ok: true,
    message: event.isPublished ? "Evento despublicado" : "Evento publicado",
  };
}

export async function deleteEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const auth = await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const event = await db.event.findUnique({
    where: { id },
    select: { coverImageUrl: true },
  });
  if (!event) return { ok: false, message: "Evento no encontrado" };

  if (event.coverImageUrl) {
    const publicId = extractCloudinaryPublicIdFromUrl(event.coverImageUrl);
    if (publicId) await destroyCloudinaryImage(publicId);
  }

  await db.event.delete({ where: { id } });

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function uploadEventCoverAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const auth = await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona una imagen" };
  }

  const event = await db.event.findUnique({
    where: { id },
    select: { coverImageUrl: true },
  });
  if (!event) return { ok: false, message: "Evento no encontrado" };

  if (event.coverImageUrl) {
    const publicId = extractCloudinaryPublicIdFromUrl(event.coverImageUrl);
    if (publicId) await destroyCloudinaryImage(publicId);
  }

  try {
    const result = await uploadImageToCloudinary(file, {
      folder: "eventos/covers",
      maxBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    await db.event.update({ where: { id }, data: { coverImageUrl: result.secureUrl } });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
    };
  }

  revalidatePath(`/admin/eventos/${id}`);
  return { ok: true, message: "Imagen de portada actualizada" };
}

export async function removeEventCoverAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const auth = await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const event = await db.event.findUnique({
    where: { id },
    select: { coverImageUrl: true },
  });
  if (!event || !event.coverImageUrl) return { ok: false, message: "No hay imagen" };

  const publicId = extractCloudinaryPublicIdFromUrl(event.coverImageUrl);
  if (publicId) await destroyCloudinaryImage(publicId);

  await db.event.update({ where: { id }, data: { coverImageUrl: null } });

  revalidatePath(`/admin/eventos/${id}`);
  return { ok: true, message: "Imagen eliminada" };
}
