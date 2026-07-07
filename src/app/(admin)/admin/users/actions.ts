"use server";

import { UserRole } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { createNeonAuthUser, deleteNeonAuthUserByEmail } from "@/lib/auth/neon-provision";
import { db } from "@/lib/db";

const createCoopAdminSchema = z.object({
  displayName: z.string().trim().min(2, "Nombre requerido."),
  email: z.string().trim().email("Correo inválido.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres."),
  cooperativeId: z.string().min(1, "Debes seleccionar una cooperativa."),
});

const createPlatformAdminSchema = z.object({
  displayName: z.string().trim().min(2, "Nombre requerido."),
  email: z.string().trim().email("Correo inválido.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres."),
});

const assignCoopAdminSchema = z.object({
  email: z.string().trim().email("Correo inválido.").transform((value) => value.toLowerCase()),
  cooperativeId: z.string().min(1, "Debes seleccionar una cooperativa."),
});

const updateManagedUserSchema = z.object({
  userId: z.string().min(1, "Usuario inválido."),
  displayName: z.string().trim().min(2, "Nombre requerido."),
  role: z.nativeEnum(UserRole),
  cooperativeId: z.string().optional().or(z.literal("")),
  isActive: z.enum(["true", "false"]),
});

export type AdminUserActionState = {
  ok: boolean;
  message: string;
};

async function ensureEmailAvailable(email: string): Promise<AdminUserActionState | null> {
  const existingLocalUser = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingLocalUser) {
    return {
      ok: false,
      message: "Este correo ya existe en la base local.",
    };
  }

  return null;
}

export async function createPlatformAdminUserAction(
  _previousState: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  await requirePlatformAdmin();

  const parsed = createPlatformAdminSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const availabilityError = await ensureEmailAvailable(parsed.data.email);
  if (availabilityError) {
    return availabilityError;
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
      role: UserRole.PLATFORM_ADMIN,
      isActive: true,
    },
  });

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: "Administrador de plataforma creado.",
  };
}

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

  const availabilityError = await ensureEmailAvailable(parsed.data.email);
  if (availabilityError) {
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

export async function updateManagedUserAction(formData: FormData): Promise<void> {
  const actor = await requirePlatformAdmin();

  const parsed = updateManagedUserSchema.safeParse({
    userId: formData.get("userId"),
    displayName: formData.get("displayName"),
    role: formData.get("role"),
    cooperativeId: formData.get("cooperativeId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const target = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: {
      id: true,
      role: true,
      isActive: true,
      cooperativeId: true,
    },
  });

  if (!target) {
    throw new Error("Usuario no encontrado.");
  }

  const nextIsActive = parsed.data.isActive === "true";
  const nextRole = parsed.data.role;
  const nextCooperativeId = nextRole === UserRole.COOP_ADMIN ? parsed.data.cooperativeId || null : null;

  if (target.id === actor.userId && !nextIsActive) {
    throw new Error("No puedes desactivar tu propio usuario.");
  }

  if (target.id === actor.userId && nextRole !== UserRole.PLATFORM_ADMIN) {
    throw new Error("No puedes quitarte el rol de administrador de plataforma.");
  }

  const removingActivePlatformPrivileges =
    target.role === UserRole.PLATFORM_ADMIN && target.isActive && (!nextIsActive || nextRole !== UserRole.PLATFORM_ADMIN);

  if (removingActivePlatformPrivileges) {
    const activePlatformAdmins = await db.user.count({
      where: { role: UserRole.PLATFORM_ADMIN, isActive: true },
    });

    if (activePlatformAdmins <= 1) {
      throw new Error("Debe existir al menos un administrador de plataforma activo.");
    }
  }

  if (nextRole === UserRole.COOP_ADMIN && nextCooperativeId) {
    const assignedToCoop = await db.user.findFirst({
      where: {
        cooperativeId: nextCooperativeId,
        isActive: true,
        id: { not: target.id },
      },
      select: { email: true },
    });

    if (assignedToCoop) {
      throw new Error(`La cooperativa ya tiene un usuario asignado (${assignedToCoop.email}).`);
    }
  }

  await db.user.update({
    where: { id: target.id },
    data: {
      displayName: parsed.data.displayName,
      role: nextRole,
      cooperativeId: nextCooperativeId,
      isActive: nextIsActive,
    },
  });

  revalidatePath("/admin/users");
}

export async function deleteUserByPlatformAction(userId: string): Promise<void> {
  const actor = await requirePlatformAdmin();

  const target = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!target) {
    throw new Error("Usuario no encontrado.");
  }

  if (target.id === actor.userId) {
    throw new Error("No puedes eliminar tu propio usuario activo.");
  }

  if (target.role === UserRole.PLATFORM_ADMIN && target.isActive) {
    const activePlatformAdmins = await db.user.count({
      where: {
        role: UserRole.PLATFORM_ADMIN,
        isActive: true,
      },
    });

    if (activePlatformAdmins <= 1) {
      throw new Error("Debe existir al menos un administrador de plataforma activo.");
    }
  }

  const neonDeleteResult = await deleteNeonAuthUserByEmail(target.email);
  if (!neonDeleteResult.ok) {
    throw new Error(
      `No se pudo eliminar en Neon Auth (${neonDeleteResult.code}): ${neonDeleteResult.message}`
    );
  }

  await db.user.delete({
    where: { id: target.id },
  });

  revalidatePath("/admin/users");
}