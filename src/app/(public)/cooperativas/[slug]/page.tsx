import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { cooperativeTypeLabels } from "@/lib/cooperative-taxonomy";
import { socialPlatformLabels } from "@/lib/social-links";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coop = await db.cooperative.findUnique({
    where: { slug },
    select: { name: true, slogan: true, municipality: { select: { name: true } } },
  });
  if (!coop) return { title: "No encontrado" };
  return {
    title: coop.name,
    description: coop.slogan ?? `Cooperativa en ${coop.municipality.name}, Puerto Rico.`,
  };
}

export default async function CooperativaDetailPage({ params }: Props) {
  const { slug } = await params;

  const coop = await db.cooperative.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      foundedYear: true,
      logoUrl: true,
      slogan: true,
      descriptionText: true,
      descriptionRich: true,
      cooperativeTypes: true,
      tags: true,
      municipalityCode: true,
      municipality: { select: { name: true } },
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true, description: true },
      },
      contacts: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, type: true, label: true, value: true },
      },
      socialLinks: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, platform: true, url: true },
      },
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, altText: true, isPrimary: true },
      },
    },
  });

  if (!coop) notFound();

  const richTextPayload =
    coop.descriptionRich &&
    typeof coop.descriptionRich === "object" &&
    "text" in (coop.descriptionRich as Record<string, unknown>)
      ? (coop.descriptionRich as { text: string }).text
      : null;

  const richHtml =
    coop.descriptionRich &&
    typeof coop.descriptionRich === "object" &&
    "html" in (coop.descriptionRich as Record<string, unknown>)
      ? (coop.descriptionRich as { html: string }).html
      : null;

  const plainDescription = coop.descriptionText?.trim() ?? "";
  const richText = richTextPayload?.trim() ?? "";

  const normalizeText = (value: string): string =>
    value
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const normalizedPlain = normalizeText(plainDescription);
  const normalizedRich = normalizeText(richText || richHtml || "");

  const hasPlainDescription = normalizedPlain.length > 0;
  const hasRichDescription = normalizedRich.length > 0;
  const richAlreadyIncludesPlain =
    hasPlainDescription && hasRichDescription && normalizedRich.startsWith(normalizedPlain);

  const primaryAddress =
    coop.contacts.find((contact) => contact.type === "ADDRESS")?.value.trim() ?? "";
  const mapEmbedSrc = primaryAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(primaryAddress)}&output=embed`
    : null;

  return (
    <div>
      {/* Hero header */}
      <div
        className="w-full py-12 px-4"
        style={{ background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)` }}
      >
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center gap-6">
          {/* Logo */}
          <div
            className="relative shrink-0 h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-2 border-white/40 bg-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
          >
            {coop.logoUrl ? (
              <Image
                src={coop.logoUrl}
                alt={`Logo de ${coop.name}`}
                fill
                className="object-contain p-2.5"
                sizes="128px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
                  <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                  <path
                    d="M20 8C13.37 8 8 13.37 8 20s5.37 12 12 12 12-5.37 12-12S26.63 8 20 8zm0 3a9 9 0 0 1 8.14 5H11.86A9 9 0 0 1 20 11zm-9 9h18a9 9 0 0 1-18 0z"
                    fill="rgba(255,255,255,0.5)"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--verde-cooperativo)" }}>
              {coop.municipality.name}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{coop.name}</h1>
            {coop.slogan && (
              <p className="mt-2 text-white/70 text-sm italic">&quot;{coop.slogan}&quot;</p>
            )}
            {coop.foundedYear && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                Fundada en {coop.foundedYear}
              </p>
            )}
            {/* Type badges */}
            {coop.cooperativeTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                {(coop.cooperativeTypes as string[]).map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: "rgba(165,236,72,0.15)", color: "var(--verde-cooperativo)", border: "1px solid rgba(165,236,72,0.3)" }}
                  >
                    {cooperativeTypeLabels[t as keyof typeof cooperativeTypeLabels] ?? t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Description */}
          {(hasPlainDescription || hasRichDescription) && (
            <section>
              <SectionHeading>Sobre la cooperativa</SectionHeading>
              {hasPlainDescription && !richAlreadyIncludesPlain && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {plainDescription}
                </p>
              )}

              {hasRichDescription ? (
                richHtml ? (
                  <div
                    className="prose-coop text-sm"
                    dangerouslySetInnerHTML={{ __html: richHtml }}
                  />
                ) : (
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {richText}
                  </p>
                )
              ) : null}
            </section>
          )}

          {/* Map */}
          {mapEmbedSrc && (
            <section>
              <SectionHeading>Ubicación</SectionHeading>
              <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
                <iframe
                  title={`Mapa de ${coop.name}`}
                  src={mapEmbedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full border-0"
                />
              </div>
            </section>
          )}

          {/* Services */}
          {coop.services.length > 0 && (
            <section>
              <SectionHeading>Servicios</SectionHeading>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coop.services.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "var(--verde-impulso)" }}>
                      {s.title}
                    </p>
                    {s.description && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {s.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Gallery */}
          {coop.gallery.length > 0 && (
            <section>
              <SectionHeading>Galería</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {coop.gallery.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.altText ?? coop.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Contact info */}
          {(coop.contacts.length > 0 || coop.socialLinks.length > 0) && (
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
            >
              <h3 className="text-sm font-bold mb-4" style={{ color: "var(--verde-impulso)" }}>
                Contacto
              </h3>
              {coop.contacts.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {coop.contacts.map((c) => (
                    <li key={c.id} className="flex items-start gap-2.5">
                      <ContactIcon type={c.type} />
                      <div className="text-sm min-w-0">
                        {c.label && (
                          <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                            {c.label}
                          </p>
                        )}
                        <ContactValue type={c.type} value={c.value} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {coop.socialLinks.length > 0 && (
                <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Redes sociales
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {coop.socialLinks.map((socialLink) => (
                      <li key={socialLink.id} className="flex items-start gap-2.5">
                        <SocialPlatformIcon platform={socialLink.platform} />
                        <a
                          href={socialLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm break-all hover:underline transition-colors ${getSocialHoverClass(
                            socialLink.platform,
                          )}`}
                          style={{ color: "var(--azul-compromiso)" }}
                        >
                          {socialPlatformLabels[socialLink.platform]}: {socialLink.url.replace(/^https?:\/\//, "")}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {coop.tags.length > 0 && (
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--verde-impulso)" }}>
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {coop.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-xs"
                    style={{ backgroundColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <Link
            href="/#directorio"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--azul-compromiso)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al directorio
          </Link>
        </aside>
      </div>
    </div>
  );
}

/* ─── Helper components ────────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-bold mb-4 pb-2 border-b"
      style={{ color: "var(--verde-impulso)", borderColor: "var(--border-subtle)" }}
    >
      {children}
    </h2>
  );
}

function ContactIcon({ type }: { type: string }) {
  const cls = "mt-0.5 shrink-0 text-[var(--azul-compromiso)]";
  switch (type) {
    case "PHONE":
      return (
        <svg className={cls} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 2.5c0 5.8 4.7 10.5 10.5 10.5 0-2-.8-2.5-2-2.5S9 11 8 10c-1 .5-1.5 1-2 0C5 9 4 8 3 6c-1-1 .5-1.5 1-2.5C4.5 2 4 1 2 1c0 0-.5.5 0 1.5z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "EMAIL":
      return (
        <svg className={cls} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "WEBSITE":
      return (
        <svg className={cls} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 1c-2 2-2 9 0 12M7 1c2 2 2 9 0 12M1 7h12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "WHATSAPP":
      return (
        <svg className={cls} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 5c0 3 2 5 5 5l1-2-2-1-.5.5C7 7 7 7 6.5 6.5L6 6l.5-.5L5 4 4 5z" fill="currentColor" />
        </svg>
      );
    case "ADDRESS":
      return (
        <svg className={cls} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1C4.24 1 2 3.24 2 6c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}

function ContactValue({ type, value }: { type: string; value: string }) {
  const baseClass = "text-sm break-all";
  const style = { color: "var(--text-secondary)" };
  switch (type) {
    case "PHONE":
    case "WHATSAPP":
      return (
        <a href={`tel:${value}`} className={`${baseClass} hover:underline`} style={{ color: "var(--azul-compromiso)" }}>
          {value}
        </a>
      );
    case "EMAIL":
      return (
        <a href={`mailto:${value}`} className={`${baseClass} hover:underline`} style={{ color: "var(--azul-compromiso)" }}>
          {value}
        </a>
      );
    case "WEBSITE":
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className={`${baseClass} hover:underline`} style={{ color: "var(--azul-compromiso)" }}>
          {value.replace(/^https?:\/\//, "")}
        </a>
      );
    default:
      return <span className={baseClass} style={style}>{value}</span>;
  }
}

function getSocialHoverClass(platform: string): string {
  switch (platform) {
    case "FACEBOOK":
      return "hover:text-[#1877F2]";
    case "INSTAGRAM":
      return "hover:text-[#E4405F]";
    case "YOUTUBE":
      return "hover:text-[#FF0000]";
    case "LINKEDIN":
      return "hover:text-[#0A66C2]";
    case "TIKTOK":
    case "X":
      return "hover:text-[#111111]";
    default:
      return "hover:text-verde-impulso";
  }
}

function SocialPlatformIcon({ platform }: { platform: string }) {
  if (platform === "FACEBOOK") {
    return (
      <svg
        className="mt-0.5 shrink-0 text-azul-compromiso"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8.2 4.3h-1c-.8 0-1.3.4-1.3 1.3v1h2l-.3 1.5H5.9V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (platform === "INSTAGRAM") {
    return (
      <svg
        className="mt-0.5 shrink-0 text-azul-compromiso"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <rect x="2" y="2" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="7" cy="7" r="2.3" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="10" cy="4" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "YOUTUBE") {
    return (
      <svg
        className="mt-0.5 shrink-0 text-azul-compromiso"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <rect x="1.7" y="3.3" width="10.6" height="7.4" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 5.6 8.9 7 6 8.4V5.6z" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "LINKEDIN") {
    return (
      <svg
        className="mt-0.5 shrink-0 text-azul-compromiso"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="4.4" cy="5" r="0.8" fill="currentColor" />
        <path d="M4.4 6.4V9.8M6.2 9.8V7.6c0-1.3 1.8-1.4 1.8 0v2.2M6.2 7.4h1.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (platform === "TIKTOK") {
    return (
      <svg
        className="mt-0.5 shrink-0 text-azul-compromiso"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <circle cx="5.2" cy="9.3" r="1.6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.8 9.3V3.5c.5 1 1.5 1.7 2.6 1.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (platform === "X") {
    return (
      <svg
        className="mt-0.5 shrink-0 text-azul-compromiso"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <path d="M3 3h2.1l2.1 2.8L9.6 3H11l-3 3.8L11 11H8.9L6.7 8.1 4.4 11H3l3.1-4L3 3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      className="mt-0.5 shrink-0 text-azul-compromiso"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 7h6M7 4v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
