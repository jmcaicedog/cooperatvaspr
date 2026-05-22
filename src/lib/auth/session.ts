import "server-only";

import { UserRole } from "@prisma/client";

import { getAuthMode, isDevBypassEnabled } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { getNeonSessionFromCookie } from "@/lib/auth/neon-auth";

export type AuthContext = {
  userId: string;
  role: UserRole;
  cooperativeId: string | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  if (isDevBypassEnabled()) {
    const rawRole = process.env.ADMIN_DEV_ROLE;
    const role = rawRole === "COOP_ADMIN" ? UserRole.COOP_ADMIN : UserRole.PLATFORM_ADMIN;

    if (role === UserRole.COOP_ADMIN) {
      const cooperativeSlug = process.env.ADMIN_DEV_COOPERATIVE_SLUG?.trim();

      if (!cooperativeSlug) {
        return null;
      }

      const cooperative = await db.cooperative.findUnique({
        where: { slug: cooperativeSlug },
        select: { id: true },
      });

      if (!cooperative) {
        return null;
      }

      return {
        userId: "dev-bypass-coop-admin",
        role,
        cooperativeId: cooperative.id,
      };
    }

    return {
      userId: "dev-bypass-platform-admin",
      role,
      cooperativeId: null,
    };
  }

  if (getAuthMode() !== "neon") {
    return null;
  }

  const session = await getNeonSessionFromCookie();
  if (!session?.user?.email) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: {
      id: true,
      role: true,
      cooperativeId: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    userId: user.id,
    role: user.role,
    cooperativeId: user.cooperativeId,
  };
}

export async function requirePlatformAdmin(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context || context.role !== UserRole.PLATFORM_ADMIN) {
    throw new Error("No autorizado para acceso de plataforma.");
  }

  return context;
}

export async function requireCoopAdminOrPlatform(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    throw new Error("No autorizado.");
  }

  if (context.role === UserRole.PLATFORM_ADMIN) {
    return context;
  }

  if (context.role === UserRole.COOP_ADMIN && context.cooperativeId) {
    return context;
  }

  throw new Error("No autorizado.");
}