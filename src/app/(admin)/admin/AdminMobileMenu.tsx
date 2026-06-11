"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/settings", label: "Ajustes" },
  { href: "/admin/cooperatives", label: "Cooperativas" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/reviews", label: "Revisiones" },
  { divider: true, label: "Contenido" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/testimonios", label: "Testimonios" },
];

export function AdminMobileMenu({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Abrir menú"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-zinc-700"
        style={{ borderColor: "#c8dad1", backgroundColor: "#f7fbf9", color: "#1f3f35" }}
        onClick={() => setOpen(true)}
        type="button"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="absolute right-0 top-0 h-full w-80 p-4 shadow-xl"
            style={{ backgroundColor: "#ffffff" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: "#16392f" }}>Navegación</p>
              <button
                aria-label="Cerrar menú"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{ borderColor: "#c8dad1", color: "#1f3f35" }}
                onClick={() => setOpen(false)}
                type="button"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>

            <div className="mb-4 rounded-xl border p-3" style={{ borderColor: "#d7e4dd", backgroundColor: "#f7fbf9" }}>
              <p className="text-xs" style={{ color: "#5f7d72" }}>Sesión activa</p>
              <p className="text-sm font-medium" style={{ color: "#1a3f34" }}>{displayName}</p>
              <a
                className="mt-2 inline-flex rounded-md border px-2.5 py-1 text-xs font-medium"
                style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                href="/auth/logout"
              >
                Cerrar sesión
              </a>
            </div>

            <nav className="space-y-1 text-sm">
              {NAV_ITEMS.map((item) => {
                if ("divider" in item) {
                  return (
                    <div key={item.label}>
                      <div className="my-2 border-t" style={{ borderColor: "#edf2ef" }} />
                      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#7e9a8f" }}>
                        {item.label}
                      </p>
                    </div>
                  );
                }

                const isActive = pathname === item.href;

                return (
                  <Link
                    className={`block rounded-lg px-3 py-2.5 font-medium ${
                      isActive
                        ? "text-white"
                        : "hover:bg-zinc-100"
                    }`}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                    style={
                      isActive
                        ? { backgroundColor: "var(--verde-impulso)", color: "#ffffff" }
                        : { color: "#1f3f35" }
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
