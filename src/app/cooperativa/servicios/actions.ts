"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

const createServiceSchema = z.object({
  cooperativeId: z.string().min(1),
  title: z.string().trim().min(2, "El titulo es obligatorio."),
  description: z.string().trim().max(1200).optional().or(z.literal("")),
});

const updateServiceSchema = z.object({
  serviceId: z.string().min(1),
  title: z.string().trim().min(2, "El titulo es obligatorio."),
  description: z.string().trim().max(1200).optional().or(z.literal("")),
});

export async function createServiceAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = createServiceSchema.safeParse({
    cooperativeId: formData.get("cooperativeId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar esta cooperativa.");
  }

  const maxSortOrder = await db.cooperativeService.aggregate({
    where: { cooperativeId: parsed.data.cooperativeId },
    _max: { sortOrder: true },
  });

  await db.cooperativeService.create({
    data: {
      cooperativeId: parsed.data.cooperativeId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/cooperativa/servicios");
}

export async function deleteServiceAction(serviceId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const service = await db.cooperativeService.findUnique({
    where: { id: serviceId },
    select: { id: true, cooperativeId: true },
  });

  if (!service) {
    throw new Error("Servicio no encontrado.");
  }

  if (!canMutateCooperative(actor, service.cooperativeId)) {
    throw new Error("No autorizado para eliminar este servicio.");
  }

  await db.cooperativeService.delete({ where: { id: service.id } });
  revalidatePath("/cooperativa/servicios");
}

export async function updateServiceAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = updateServiceSchema.safeParse({
    serviceId: formData.get("serviceId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const service = await db.cooperativeService.findUnique({
    where: { id: parsed.data.serviceId },
    select: { id: true, cooperativeId: true },
  });

  if (!service) {
    throw new Error("Servicio no encontrado.");
  }

  if (!canMutateCooperative(actor, service.cooperativeId)) {
    throw new Error("No autorizado para actualizar este servicio.");
  }

  await db.cooperativeService.update({
    where: { id: service.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/cooperativa/servicios");
}

export async function toggleServiceAction(serviceId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const service = await db.cooperativeService.findUnique({
    where: { id: serviceId },
    select: { id: true, cooperativeId: true, isActive: true },
  });

  if (!service) {
    throw new Error("Servicio no encontrado.");
  }

  if (!canMutateCooperative(actor, service.cooperativeId)) {
    throw new Error("No autorizado para actualizar este servicio.");
  }

  await db.cooperativeService.update({
    where: { id: service.id },
    data: { isActive: !service.isActive },
  });

  revalidatePath("/cooperativa/servicios");
}