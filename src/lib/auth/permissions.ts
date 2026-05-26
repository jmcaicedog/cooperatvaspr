import "server-only";

import { UserRole } from "@prisma/client";

export function isPlatformAdmin(role: UserRole | null | undefined): boolean {
  return role === UserRole.PLATFORM_ADMIN;
}

export function getAuthMode(): "neon" | "unknown" {
  if (process.env.ADMIN_AUTH_MODE === "neon") {
    return "neon";
  }

  return "unknown";
}

export function isDevBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.ADMIN_DEV_BYPASS === "true";
}