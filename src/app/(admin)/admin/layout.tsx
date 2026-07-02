import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminMobileMenu } from "@/app/(admin)/admin/AdminMobileMenu";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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

  const navItems = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/settings", label: "Ajustes" },
    { href: "/admin/cooperatives", label: "Cooperativas" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/banners", label: "Banners" },
    { href: "/admin/reviews", label: "Revisiones" },
  ];

  const contentItems = [
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/eventos", label: "Eventos" },
    { href: "/admin/testimonios", label: "Testimonios" },
  ];


  return (
    <div className="min-h-screen text-zinc-950" data-scope="admin" style={{ background: "linear-gradient(180deg, #eef4f2 0%, #f6f8fb 100%)" }}>
      <header className="border-b" style={{ borderColor: "#d7e4dd", backgroundColor: "#f3f8f5cc", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div>
              <Image
                src="/brand/logo-verde-claro.svg"
                alt="cooperativas.pr"
                width={266}
                height={28}
                priority
              />
              <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: "#54736a" }}>Panel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl border px-3 py-2 text-right text-sm lg:block" style={{ borderColor: "#d7e4dd", backgroundColor: "#f7fbf9", color: "#406157" }}>
              <p className="font-medium" style={{ color: "#1a3f34" }}>{displayName}</p>
              <a
                className="mt-1 inline-flex rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
                style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
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

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_1fr]">
        <aside className="hidden rounded-2xl border p-4 lg:block" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7e9a8f" }}>
            Navegación
          </p>
          <nav className="space-y-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-zinc-100"
                href={item.href}
                style={{ color: "#1f3f35" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t" style={{ borderColor: "#edf2ef" }} />
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7e9a8f" }}>
              Contenido
            </p>
            {contentItems.map((item) => (
              <Link
                key={item.href}
                className="block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-zinc-100"
                href={item.href}
                style={{ color: "#1f3f35" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 rounded-2xl border p-4 sm:p-6" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          {children}
        </main>
      </div>
    </div>
  );
}