import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminMobileMenu } from "@/app/(admin)/admin/AdminMobileMenu";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authContext = await (async () => {
    try {
      return await requirePlatformAdmin();
    } catch {
      return null;
    }
  })();

  if (!authContext) {
    redirect("/login?next=/admin");
  }

  const userRecord = await db.user.findUnique({
        where: { id: authContext.userId },
        select: { displayName: true },
      });

  const displayName = userRecord?.displayName || "Usuario plataforma";

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Directorio de Cooperativas</p>
            <h1 className="text-lg font-semibold">Panel Administrativo</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right text-sm text-zinc-600 lg:block">
              <p className="font-medium text-zinc-800">{displayName}</p>
              <a
                className="mt-1 inline-flex rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                href="/auth/logout"
              >
                Cerrar sesión
              </a>
            </div>
            <div className="lg:hidden">
              <AdminMobileMenu displayName={displayName} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden rounded-lg border border-zinc-200 bg-white p-4 lg:block">
          <nav className="space-y-1 text-sm">
            <Link className="block rounded px-3 py-2 hover:bg-zinc-100" href="/admin">
              Resumen
            </Link>
            <Link
              className="block rounded px-3 py-2 hover:bg-zinc-100"
              href="/admin/cooperatives"
            >
              Cooperativas
            </Link>
            <Link className="block rounded px-3 py-2 hover:bg-zinc-100" href="/admin/users">
              Usuarios
            </Link>
            <Link className="block rounded px-3 py-2 hover:bg-zinc-100" href="/admin/banners">
              Banners
            </Link>
            <Link className="block rounded px-3 py-2 hover:bg-zinc-100" href="/admin/reviews">
              Revisiones
            </Link>
            <div className="my-2 border-t border-zinc-100" />
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Contenido
            </p>
            <Link className="block rounded px-3 py-2 hover:bg-zinc-100" href="/admin/blog">
              Blog
            </Link>
            <Link className="block rounded px-3 py-2 hover:bg-zinc-100" href="/admin/eventos">
              Eventos
            </Link>
            <Link
              className="block rounded px-3 py-2 hover:bg-zinc-100"
              href="/admin/testimonios"
            >
              Testimonios
            </Link>
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}