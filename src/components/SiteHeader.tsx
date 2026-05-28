"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#directorio", label: "Directorio" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.replace("/#", "/"));
  };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: "var(--verde-impulso)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/logo-verde.svg"
            alt="cooperativas.pr"
            width={160}
            height={17}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive(link.href)
                  ? "text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {isActive(link.href) && (
                <span
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  style={{ backgroundColor: "var(--verde-cooperativo)" }}
                />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "var(--verde-cooperativo)",
              color: "var(--verde-impulso)",
            }}
          >
            Acceso
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "var(--verde-impulso)" }}
        >
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Navegación móvil">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor: "var(--verde-cooperativo)",
                  color: "var(--verde-impulso)",
                }}
              >
                Acceso cooperativa
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
