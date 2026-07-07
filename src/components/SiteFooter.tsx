import Image from "next/image";
import Link from "next/link";

function AltaCommunicationMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1171.14 654.55"
      className="h-3.5 w-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M283.32 592.2v-50.34h-1.17c-23.37 39.83-66.14 58.63-110.04 58.63C62.64 600.49 0 516.7 0 431.22c0-79.02 55.61-172.08 172.1-172.09 45.09 0 86.67 18.71 110.04 54.42h1.17v-45.67h60.9l.01 324.31h-60.9ZM172.1 314.74c-74.95 0-111.23 65-111.23 115.92 0 58.55 46.29 114.15 110.66 114.15 63.8 0 113.01-52.13 113.01-114.16 0-69.1-49.79-115.91-112.43-115.91Z"
          fill="#ffffff"
        />
        <path d="M393.21 592.19 393.18 0h63.28l.02 534.26h174.94v57.92H393.2Z" fill="#ffffff" />
        <path d="M711.76 654.55V279.28H538.85v-57.95l297.59-.01v57.95h-61.45v375.27h-63.23Z" fill="#ffffff" />
        <path
          d="M1110.27 592.17v-50.34h-1.19c-23.42 39.83-66.15 58.63-110.05 58.63-109.5 0-172.15-83.79-172.15-169.27 0-79.02 55.62-172.08 172.14-172.09 45.05 0 86.63 18.71 110.05 54.42h1.19v-45.67h60.87l.01 324.31h-60.87ZM999.02 314.71c-74.93 0-111.21 65-111.21 115.92 0 58.55 46.23 114.15 110.6 114.15 63.8 0 113.04-52.13 113.04-114.16 0-69.1-49.83-115.91-112.43-115.91"
          fill="#ffffff"
        />
        <path d="M661.22 330.92v153.17H508.11V330.92z" fill="#93d500" />
      </g>
    </svg>
  );
}

const FOOTER_LINKS_BASE = [
  {
    heading: "Portal",
    links: [
      { href: "/", label: "Inicio" },
      { href: "/#directorio", label: "Directorio" },
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

export function SiteFooter({
  showEventsLink = true,
  showBlogLink = true,
}: {
  showEventsLink?: boolean;
  showBlogLink?: boolean;
}) {
  const portalLinks = [...FOOTER_LINKS_BASE[0].links];
  if (showEventsLink) {
    portalLinks.splice(2, 0, { href: "/eventos", label: "Eventos" });
  }
  if (showBlogLink) {
    portalLinks.splice(showEventsLink ? 3 : 2, 0, { href: "/blog", label: "Blog" });
  }

  const footerColumns = [
    { ...FOOTER_LINKS_BASE[0], links: portalLinks },
    FOOTER_LINKS_BASE[1],
  ];

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
                width={310}
                height={32}
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Directorio oficial de cooperativas en Puerto Rico. Construido con orgullo boricua.
            </p>
          </div>

          {/* Nav columns */}
          {footerColumns.map((col) => (
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
          <Link
            href="https://www.altacommunication.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-100"
            style={{ color: "rgba(255,255,255,0.55)" }}
            aria-label="Hecho por Alta Communication"
          >
            <span>Hecho por</span>
            <AltaCommunicationMark />
          </Link>
        </div>
      </div>
    </footer>
  );
}
