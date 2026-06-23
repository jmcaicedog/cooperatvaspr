"use server";

import { SocialPlatform } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";
import { normalizeSocialUrl } from "@/lib/social-links";

const createSocialLinkSchema = z.object({
  cooperativeId: z.string().min(1),
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().trim().min(5, "El enlace de la red social es obligatorio."),
});

const updateSocialLinkSchema = z.object({
  socialLinkId: z.string().min(1),
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().trim().min(5, "El enlace de la red social es obligatorio."),
});

function revalidateSocialViews(cooperativeId: string, slug?: string): void {
  revalidatePath("/cooperativa/contactos");
  revalidatePath("/admin/cooperatives");
  revalidatePath(`/admin/cooperatives/${cooperativeId}`);
  if (slug) {
    revalidatePath(`/cooperativas/${slug}`);
  }
}

export async function createSocialLinkAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = createSocialLinkSchema.safeParse({
    cooperativeId: formData.get("cooperativeId"),
    platform: formData.get("platform"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar redes sociales de esta cooperativa.");
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: parsed.data.cooperativeId },
    select: { id: true, slug: true },
  });

  if (!cooperative) {
    throw new Error("Cooperativa no encontrada.");
  }

  const maxSortOrder = await db.socialLink.aggregate({
    where: { cooperativeId: parsed.data.cooperativeId },
    _max: { sortOrder: true },
  });

  await db.socialLink.create({
    data: {
      cooperativeId: parsed.data.cooperativeId,
      platform: parsed.data.platform,
      url: normalizeSocialUrl(parsed.data.url),
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidateSocialViews(cooperative.id, cooperative.slug);
}

export async function updateSocialLinkAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = updateSocialLinkSchema.safeParse({
    socialLinkId: formData.get("socialLinkId"),
    platform: formData.get("platform"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const socialLink = await db.socialLink.findUnique({
    where: { id: parsed.data.socialLinkId },
    select: {
      id: true,
      cooperativeId: true,
      cooperative: { select: { slug: true } },
    },
  });

  if (!socialLink) {
    throw new Error("Red social no encontrada.");
  }

  if (!canMutateCooperative(actor, socialLink.cooperativeId)) {
    throw new Error("No autorizado para actualizar esta red social.");
  }

  await db.socialLink.update({
    where: { id: socialLink.id },
    data: {
      platform: parsed.data.platform,
      url: normalizeSocialUrl(parsed.data.url),
    },
  });

  revalidateSocialViews(socialLink.cooperativeId, socialLink.cooperative.slug);
}

export async function deleteSocialLinkAction(socialLinkId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const socialLink = await db.socialLink.findUnique({
    where: { id: socialLinkId },
    select: {
      id: true,
      cooperativeId: true,
      cooperative: { select: { slug: true } },
    },
  });

  if (!socialLink) {
    throw new Error("Red social no encontrada.");
  }

  if (!canMutateCooperative(actor, socialLink.cooperativeId)) {
    throw new Error("No autorizado para eliminar esta red social.");
  }

  await db.socialLink.delete({ where: { id: socialLink.id } });
  revalidateSocialViews(socialLink.cooperativeId, socialLink.cooperative.slug);
}
