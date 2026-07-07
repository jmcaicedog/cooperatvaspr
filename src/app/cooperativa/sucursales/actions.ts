"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

const branchSchema = z.object({
  cooperativeId: z.string().min(1),
  municipalityCode: z.string().trim().min(1, "El municipio es obligatorio."),
  label: z.string().trim().max(100).optional().or(z.literal("")),
  address: z.string().trim().min(5, "La dirección es obligatoria."),
});

const updateBranchSchema = branchSchema.extend({
  branchId: z.string().min(1),
});

async function revalidateBranchViews(cooperativeId: string): Promise<void> {
  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeId },
    select: { id: true, slug: true },
  });

  if (!cooperative) {
    return;
  }

  revalidatePath("/");
  revalidatePath("/cooperativa/sucursales");
  revalidatePath(`/cooperativas/${cooperative.slug}`);
  revalidatePath("/admin/cooperatives");
  revalidatePath(`/admin/cooperatives/${cooperative.id}`);
}

export async function createBranchAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  const parsed = branchSchema.safeParse({
    cooperativeId: formData.get("cooperativeId"),
    municipalityCode: formData.get("municipalityCode"),
    label: formData.get("label"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar sucursales de esta cooperativa.");
  }

  const maxSortOrder = await db.cooperativeBranch.aggregate({
    where: { cooperativeId: parsed.data.cooperativeId },
    _max: { sortOrder: true },
  });

  await db.cooperativeBranch.create({
    data: {
      cooperativeId: parsed.data.cooperativeId,
      municipalityCode: parsed.data.municipalityCode,
      label: parsed.data.label || null,
      address: parsed.data.address,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await revalidateBranchViews(parsed.data.cooperativeId);
}

export async function updateBranchAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  const parsed = updateBranchSchema.safeParse({
    branchId: formData.get("branchId"),
    cooperativeId: formData.get("cooperativeId"),
    municipalityCode: formData.get("municipalityCode"),
    label: formData.get("label"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar sucursales de esta cooperativa.");
  }

  const branch = await db.cooperativeBranch.findUnique({
    where: { id: parsed.data.branchId },
    select: { id: true, cooperativeId: true },
  });

  if (!branch) {
    throw new Error("Sucursal no encontrada.");
  }

  if (branch.cooperativeId !== parsed.data.cooperativeId) {
    throw new Error("Sucursal inválida.");
  }

  await db.cooperativeBranch.update({
    where: { id: branch.id },
    data: {
      municipalityCode: parsed.data.municipalityCode,
      label: parsed.data.label || null,
      address: parsed.data.address,
    },
  });

  await revalidateBranchViews(branch.cooperativeId);
}

export async function deleteBranchAction(branchId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const branch = await db.cooperativeBranch.findUnique({
    where: { id: branchId },
    select: { id: true, cooperativeId: true },
  });

  if (!branch) {
    throw new Error("Sucursal no encontrada.");
  }

  if (!canMutateCooperative(actor, branch.cooperativeId)) {
    throw new Error("No autorizado para eliminar esta sucursal.");
  }

  await db.cooperativeBranch.delete({ where: { id: branch.id } });
  await revalidateBranchViews(branch.cooperativeId);
}
