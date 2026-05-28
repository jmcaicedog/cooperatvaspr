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

  const navItems = [
    { href: "/admin", label: "Resumen" },
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
      <header className="border-b" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffffcc", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--verde-impulso)", color: "var(--verde-cooperativo)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 18V8l8-4 8 4v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 18v-4h6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#54736a" }}>Directorio de Cooperativas</p>
              <h1 className="text-lg font-semibold" style={{ color: "#0f2c24" }}>Panel Administrativo</h1>
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