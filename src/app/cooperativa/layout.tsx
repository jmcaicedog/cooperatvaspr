import Link from "next/link";
import { redirect } from "next/navigation";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";

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

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Panel de Cooperativa</p>
            <div className="text-right text-sm text-zinc-600">
              <p>{`Rol activo: ${actor.role}`}</p>
              <a className="text-xs underline" href="/auth/logout">
                Cerrar sesion
              </a>
            </div>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link className="rounded-md border border-zinc-300 px-3 py-1.5" href="/cooperativa">
              Inicio
            </Link>
            <Link className="rounded-md border border-zinc-300 px-3 py-1.5" href="/cooperativa/perfil">
              Perfil
            </Link>
            <Link
              className="rounded-md border border-zinc-300 px-3 py-1.5"
              href="/cooperativa/servicios"
            >
              Servicios
            </Link>
            <Link
              className="rounded-md border border-zinc-300 px-3 py-1.5"
              href="/cooperativa/contactos"
            >
              Contactos
            </Link>
            <Link
              className="rounded-md border border-zinc-300 px-3 py-1.5"
              href="/cooperativa/galeria"
            >
              Galeria
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
