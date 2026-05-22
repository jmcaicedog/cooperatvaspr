import Link from "next/link";
import { redirect } from "next/navigation";

import { requirePlatformAdmin } from "@/lib/auth/session";

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

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Directorio de Cooperativas</p>
            <h1 className="text-lg font-semibold">Panel Administrativo</h1>
          </div>
          <div className="text-right text-sm text-zinc-600">
            <p>{authContext ? `Rol activo: ${authContext.role}` : "Sin sesión"}</p>
            <a className="text-xs underline" href="/auth/logout">
              Cerrar sesión
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-4">
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
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}