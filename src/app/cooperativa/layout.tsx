import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { CooperativeTabs } from "@/app/cooperativa/CooperativeTabs";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function CooperativaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const actor = await (async () => {
    try {
      return await requireCoopAdminOrPlatform();
    } catch {
      return null;
    }
  })();

  if (!actor) {
    redirect("/login?next=/cooperativa");
  }

  const profileLabel = actor.role === UserRole.PLATFORM_ADMIN ? "Administrador" : "Editor";

  const userRecord = actor.userId.startsWith("dev-bypass")
    ? null
    : await db.user.findUnique({
        where: { id: actor.userId },
        select: { displayName: true },
      });

  const displayName =
    userRecord?.displayName || (actor.role === UserRole.PLATFORM_ADMIN ? "Usuario plataforma" : "Usuario cooperativa");

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Panel de Cooperativa</p>
            <div className="text-right text-sm text-zinc-600">
              <p className="font-medium text-zinc-800">{displayName}</p>
              <p className="text-xs text-zinc-500">{profileLabel}</p>
              <a
                className="mt-1 inline-flex rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                href="/auth/logout"
              >
                Cerrar sesion
              </a>
            </div>
          </div>
          <CooperativeTabs />
        </header>
        {children}
      </div>
    </div>
  );
}
