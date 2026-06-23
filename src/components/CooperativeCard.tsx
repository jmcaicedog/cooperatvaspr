import Image from "next/image";
import Link from "next/link";
import { cooperativeTypeLabels } from "@/lib/cooperative-taxonomy";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  TRABAJO_ASOCIADO:      { bg: "#003024",  text: "#a5ec48" },
  CONSUMIDORES_USUARIOS: { bg: "#14bfed22", text: "#006b8a" },
  VIVIENDA:              { bg: "#a5ec4822", text: "#2e6a00" },
  ENERGIA:               { bg: "#fffe0022", text: "#7a6800" },
};

export type CooperativeListItem = {
  id: string;
  name: string;
  slug: string;
  municipalityCode: string;
  municipalityName: string;
  logoUrl: string | null;
  slogan: string | null;
  cooperativeTypes: string[];
  tags: string[];
};

export function CooperativeCard({ coop }: { coop: CooperativeListItem }) {
  return (
    <Link
      href={`/cooperativas/${coop.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Logo area */}
      <div
        className="relative flex h-36 w-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: "var(--verde-cooperativo)" }}
        />
        {coop.logoUrl ? (
          <Image
            src={coop.logoUrl}
            alt={`Logo de ${coop.name}`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          />
        ) : (
          <CoopPlaceholderIcon />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + Municipality */}
        <div>
          <h3
            className="font-bold text-base leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity"
            style={{ color: "var(--verde-impulso)" }}
          >
            {coop.name}
          </h3>
          {coop.municipalityName && (
            <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true" className="shrink-0">
                <path
                  d="M5.5 0C3.01 0 1 2.01 1 4.5c0 3.38 4.5 8.5 4.5 8.5s4.5-5.12 4.5-8.5C10 2.01 7.99 0 5.5 0zm0 6.1a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z"
                  fill="currentColor"
                />
              </svg>
              {coop.municipalityName}
            </p>
          )}
        </div>

        {/* Slogan */}
        {coop.slogan && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "var(--text-muted)", fontStyle: "italic" }}
          >
            "{coop.slogan}"
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Type badges */}
        {coop.cooperativeTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {coop.cooperativeTypes.map((t) => {
              const colors = TYPE_COLORS[t] ?? { bg: "#e5e7eb", text: "#374151" };
              return (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {cooperativeTypeLabels[t as keyof typeof cooperativeTypeLabels] ?? t}
                </span>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {coop.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {coop.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full px-2 py-0.5 text-[10px]"
                style={{ backgroundColor: "var(--border-subtle)", color: "var(--text-muted)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function CoopPlaceholderIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="opacity-30"
    >
      <circle cx="24" cy="24" r="20" stroke="#003024" strokeWidth="2" />
      <path
        d="M24 12C17.373 12 12 17.373 12 24s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 4a8 8 0 0 1 7.196 4.5H16.804A8 8 0 0 1 24 16zm-8 8h16a8 8 0 0 1-16 0z"
        fill="#003024"
      />
    </svg>
  );
}
