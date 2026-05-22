"use server";

import { ContactType } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { canMutateCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

const createContactSchema = z.object({
  cooperativeId: z.string().min(1),
  type: z.nativeEnum(ContactType),
  label: z.string().trim().max(100).optional().or(z.literal("")),
  value: z.string().trim().min(2, "El valor de contacto es obligatorio."),
});

export async function createContactAction(formData: FormData): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const parsed = createContactSchema.safeParse({
    cooperativeId: formData.get("cooperativeId"),
    type: formData.get("type"),
    label: formData.get("label"),
    value: formData.get("value"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  if (!canMutateCooperative(actor, parsed.data.cooperativeId)) {
    throw new Error("No autorizado para editar contactos de esta cooperativa.");
  }

  const maxSortOrder = await db.contactPoint.aggregate({
    where: { cooperativeId: parsed.data.cooperativeId },
    _max: { sortOrder: true },
  });

  await db.contactPoint.create({
    data: {
      cooperativeId: parsed.data.cooperativeId,
      type: parsed.data.type,
      label: parsed.data.label || null,
      value: parsed.data.value,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/cooperativa/contactos");
}

export async function deleteContactAction(contactId: string): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();

  const contact = await db.contactPoint.findUnique({
    where: { id: contactId },
    select: { id: true, cooperativeId: true },
  });

  if (!contact) {
    throw new Error("Contacto no encontrado.");
  }

  if (!canMutateCooperative(actor, contact.cooperativeId)) {
    throw new Error("No autorizado para eliminar este contacto.");
  }

  await db.contactPoint.delete({ where: { id: contact.id } });
  revalidatePath("/cooperativa/contactos");
}