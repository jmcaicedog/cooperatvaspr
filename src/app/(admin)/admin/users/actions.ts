"use server";

import { UserRole } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { createNeonAuthUser } from "@/lib/auth/neon-provision";
import { db } from "@/lib/db";

const createCoopAdminSchema = z.object({
  displayName: z.string().trim().min(2, "Nombre requerido."),
  email: z.string().trim().email("Correo inválido.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres."),
  cooperativeId: z.string().min(1, "Debes seleccionar una cooperativa."),
});

const assignCoopAdminSchema = z.object({
  email: z.string().trim().email("Correo inválido.").transform((value) => value.toLowerCase()),
  cooperativeId: z.string().min(1, "Debes seleccionar una cooperativa."),
});

export type AdminUserActionState = {
  ok: boolean;
  message: string;
};

export async function createCoopAdminUserAction(
  _previousState: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  await requirePlatformAdmin();

  const parsed = createCoopAdminSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    cooperativeId: formData.get("cooperativeId"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: parsed.data.cooperativeId },
    select: { id: true, name: true },
  });

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  const assignedToCoop = await db.user.findFirst({
    where: { cooperativeId: cooperative.id, isActive: true },
    select: { id: true, email: true },
  });

  if (assignedToCoop) {
    return {
      ok: false,
      message: `La cooperativa ya tiene un usuario asignado (${assignedToCoop.email}).`,
    };
  }

  const existingLocalUser = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingLocalUser) {
    return {
      ok: false,
      message: "Este correo ya existe en la base local. Usa el formulario de asignación.",
    };
  }

  const neonResult = await createNeonAuthUser({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.displayName,
  });

  if (!neonResult.ok) {
    return {
      ok: false,
      message: `Neon Auth: ${neonResult.message}`,
    };
  }

  await db.user.create({
    data: {
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      role: UserRole.COOP_ADMIN,
      cooperativeId: cooperative.id,
      isActive: true,
    },
  });

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: `Usuario creado y asignado a ${cooperative.name}.`,
  };
}

export async function assignExistingUserAction(
  _previousState: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  await requirePlatformAdmin();

  const parsed = assignCoopAdminSchema.safeParse({
    email: formData.get("email"),
    cooperativeId: formData.get("cooperativeId"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, cooperativeId: true, isActive: true },
  });

  if (!user) {
    return { ok: false, message: "No existe usuario local con ese correo." };
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: parsed.data.cooperativeId },
    select: { id: true, name: true },
  });

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  const assignedToCoop = await db.user.findFirst({
    where: {
      cooperativeId: cooperative.id,
      isActive: true,
      id: { not: user.id },
    },
    select: { id: true, email: true },
  });

  if (assignedToCoop) {
    return {
      ok: false,
      message: `La cooperativa ya tiene un usuario asignado (${assignedToCoop.email}).`,
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      role: UserRole.COOP_ADMIN,
      cooperativeId: cooperative.id,
      isActive: true,
    },
  });

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: `Usuario ${user.email} asignado a ${cooperative.name}.`,
  };
}

export async function unassignCoopAdminAction(userId: string): Promise<void> {
  await requirePlatformAdmin();

  await db.user.update({
    where: { id: userId },
    data: {
      cooperativeId: null,
      role: UserRole.COOP_ADMIN,
    },
  });

  revalidatePath("/admin/users");
}