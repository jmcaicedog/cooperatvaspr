"use server";

import { CooperativeStatus, ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { cooperativeCreateSchema, toSlug } from "@/lib/validators/cooperative";

export type CooperativeActionState = {
  ok: boolean;
  message: string;
};

export async function createCooperativeAction(
  _previousState: CooperativeActionState,
  formData: FormData
): Promise<CooperativeActionState> {
  await requirePlatformAdmin();

  const parsed = cooperativeCreateSchema.safeParse({
    name: formData.get("name"),
    municipalityCode: formData.get("municipalityCode"),
    slogan: formData.get("slogan"),
    descriptionText: formData.get("descriptionText"),
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
      slogan: parsed.data.slogan || null,
      descriptionText: parsed.data.descriptionText || null,
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