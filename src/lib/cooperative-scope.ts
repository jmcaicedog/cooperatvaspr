import "server-only";

import { UserRole } from "@prisma/client";

import type { AuthContext } from "@/lib/auth/session";
import { db } from "@/lib/db";

export type ScopedCooperative = {
  id: string;
  name: string;
  slug: string;
};

export async function getScopedCooperative(actor: AuthContext): Promise<ScopedCooperative | null> {
  if (actor.role === UserRole.COOP_ADMIN) {
    if (!actor.cooperativeId) {
      return null;
    }

    return db.cooperative.findUnique({
      where: { id: actor.cooperativeId },
      select: { id: true, name: true, slug: true },
    });
  }

  return db.cooperative.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export function canMutateCooperative(actor: AuthContext, cooperativeId: string): boolean {
  if (actor.role === UserRole.PLATFORM_ADMIN) {
    return true;
  }

  return actor.role === UserRole.COOP_ADMIN && actor.cooperativeId === cooperativeId;
}