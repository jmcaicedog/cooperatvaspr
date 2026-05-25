"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/cooperativa/perfil", label: "Perfil" },
  { href: "/cooperativa/servicios", label: "Servicios" },
  { href: "/cooperativa/contactos", label: "Contactos" },
  { href: "/cooperativa/galeria", label: "Galeria" },
];

type CooperativeMobileMenuProps = {
  displayName: string;
  profileLabel: string;
};

export function CooperativeMobileMenu({ displayName, profileLabel }: CooperativeMobileMenuProps) {
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
        aria-label="Abrir menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        onClick={() => setOpen(true)}
        type="button"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setOpen(false)} role="presentation">
          <div
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-800">Menu cooperativa</p>
              <button
                aria-label="Cerrar menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                onClick={() => setOpen(false)}
                type="button"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>

            <div className="mb-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-sm font-medium text-zinc-800">{displayName}</p>
              <p className="text-xs text-zinc-500">{profileLabel}</p>
              <a
                className="mt-2 inline-flex rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                href="/auth/logout"
              >
                Cerrar sesion
              </a>
            </div>

            <nav className="space-y-1 text-sm">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    className={`block rounded-md px-3 py-2 ${
                      isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
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
