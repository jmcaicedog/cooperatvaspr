import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Portal",
    links: [
      { href: "/", label: "Inicio" },
      { href: "/#directorio", label: "Directorio" },
      { href: "/eventos", label: "Eventos" },
      { href: "/blog", label: "Blog" },
      { href: "/quienes-somos", label: "Quiénes somos" },
    ],
  },
  {
    heading: "Recursos",
    links: [
      { href: "/servicios", label: "Servicios" },
      { href: "/contacto", label: "Contacto" },
      { href: "/login", label: "Acceso cooperativa" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      className="mt-auto w-full"
      style={{ backgroundColor: "var(--verde-impulso)", color: "rgba(255,255,255,0.7)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center w-fit">
              <Image
                src="/brand/logo-verde.svg"
                alt="cooperativas.pr"
                width={160}
                height={17}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Directorio oficial de cooperativas en Puerto Rico. Construido con orgullo boricua.
            </p>
          </div>

          {/* Nav columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <p>© {new Date().getFullYear()} cooperativas.pr — Todos los derechos reservados</p>
          <p>
            Hecho en{" "}
            <span style={{ color: "var(--verde-cooperativo)" }}>Puerto Rico 🌿</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
