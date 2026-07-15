"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export type TestimonialActionState = {
  ok: boolean;
  message: string;
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  authorRole: z.string().trim().max(100).optional().or(z.literal("")),
  authorOrganization: z.string().trim().max(150).optional().or(z.literal("")),
  body: z.string().trim().min(10, "El testimonio es obligatorio").max(800),
});

// ─── Acciones ─────────────────────────────────────────────────────────────────

export async function createTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  const auth = await requirePlatformAdmin();

  const parsed = testimonialSchema.safeParse({
    authorName: formData.get("authorName"),
    authorRole: formData.get("authorRole") || "",
    authorOrganization: formData.get("authorOrganization") || "",
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { authorName, authorRole, authorOrganization, body } = parsed.data;

  const maxOrder = await db.testimonial.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  await db.testimonial.create({
    data: {
      authorName,
      authorRole: authorRole || null,
      authorOrganization: authorOrganization || null,
      body,
      sortOrder: nextOrder,
      createdById: auth.userId,
    },
  });

  revalidatePath("/admin/testimonios");
  return { ok: true, message: "Testimonio creado" };
}

export async function updateTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const parsed = testimonialSchema.safeParse({
    authorName: formData.get("authorName"),
    authorRole: formData.get("authorRole") || "",
    authorOrganization: formData.get("authorOrganization") || "",
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { authorName, authorRole, authorOrganization, body } = parsed.data;

  await db.testimonial.update({
    where: { id },
    data: {
      authorName,
      authorRole: authorRole || null,
      authorOrganization: authorOrganization || null,
      body,
    },
  });

  revalidatePath("/admin/testimonios");
  return { ok: true, message: "Testimonio actualizado" };
}

export async function togglePublishTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const testimonial = await db.testimonial.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!testimonial) return { ok: false, message: "Testimonio no encontrado" };

  await db.testimonial.update({
    where: { id },
    data: { isPublished: !testimonial.isPublished },
  });

  revalidatePath("/admin/testimonios");
  return {
    ok: true,
    message: testimonial.isPublished ? "Testimonio desactivado" : "Testimonio activado",
  };
}

export async function deleteTestimonialAction(
  _prev: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const testimonial = await db.testimonial.findUnique({
    where: { id },
    select: { avatarUrl: true },
  });
  if (!testimonial) return { ok: false, message: "Testimonio no encontrado" };

  if (testimonial.avatarUrl) {
    const publicId = extractCloudinaryPublicIdFromUrl(testimonial.avatarUrl);
    if (publicId) await destroyCloudinaryImage(publicId);
  }

  await db.testimonial.delete({ where: { id } });

  revalidatePath("/admin/testimonios");
  return { ok: true, message: "Testimonio eliminado" };
}

export async function uploadAvatarAction(
  _prev: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  try {
    await requirePlatformAdmin();

    const id = formData.get("id");
    if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Selecciona una imagen" };
    }

    const testimonial = await db.testimonial.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });
    if (!testimonial) return { ok: false, message: "Testimonio no encontrado" };

    if (testimonial.avatarUrl) {
      const publicId = extractCloudinaryPublicIdFromUrl(testimonial.avatarUrl);
      if (publicId) await destroyCloudinaryImage(publicId);
    }

    const result = await uploadImageToCloudinary(file, {
      folder: "testimonios/avatars",
      maxBytes: 2 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    await db.testimonial.update({ where: { id }, data: { avatarUrl: result.secureUrl } });

    revalidatePath("/admin/testimonios");
    return { ok: true, message: "Avatar actualizado" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
    };
  }
}

export async function removeAvatarAction(
  _prev: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  try {
    await requirePlatformAdmin();

    const id = formData.get("id");
    if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

    const testimonial = await db.testimonial.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });
    if (!testimonial || !testimonial.avatarUrl) return { ok: false, message: "No hay avatar" };

    const publicId = extractCloudinaryPublicIdFromUrl(testimonial.avatarUrl);
    if (publicId) await destroyCloudinaryImage(publicId);

    await db.testimonial.update({ where: { id }, data: { avatarUrl: null } });

    revalidatePath("/admin/testimonios");
    return { ok: true, message: "Avatar eliminado" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo eliminar el avatar.",
    };
  }
}
