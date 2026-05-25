import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { CooperativeMobileMenu } from "@/app/cooperativa/CooperativeMobileMenu";
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
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Panel de Cooperativa</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="hidden text-right text-sm text-zinc-600 lg:block">
                <p className="font-medium text-zinc-800">{displayName}</p>
                <p className="text-xs text-zinc-500">{profileLabel}</p>
                <a
                  className="mt-1 inline-flex rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  href="/auth/logout"
                >
                  Cerrar sesion
                </a>
              </div>
              <div className="lg:hidden">
                <CooperativeMobileMenu displayName={displayName} profileLabel={profileLabel} />
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <CooperativeTabs />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
