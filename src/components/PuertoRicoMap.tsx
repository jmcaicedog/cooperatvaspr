"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import {
  fipsToMunicipalityCode,
  municipalityCentroids,
} from "@/lib/municipality-centroids";
import type { CooperativeListItem } from "./CooperativeCard";

const GEO_URL = "/geo/municipios-pr.json";

type Props = {
  cooperatives: CooperativeListItem[];
};

type TooltipState = {
  municipality: string;
  cooperatives: Array<{
    name: string;
    slug: string;
  }>;
} | null;

function getLabelWidth(label: string) {
  const estimated = Math.ceil(label.length * 4.2) + 12;
  return Math.max(76, Math.min(estimated, 140));
}

function getLabelLayout([lon, lat]: [number, number], labelWidth: number) {
  let rectX = -labelWidth / 2;
  let textX = rectX + 6;

  // Municipios del este: desplazar etiqueta hacia la izquierda.
  if (lon > -65.78) {
    rectX = -(labelWidth + 2);
    textX = rectX + 6;
  }

  // Municipios del oeste: desplazar etiqueta hacia la derecha.
  if (lon < -67.0) {
    rectX = 2;
    textX = 6;
  }

  // Municipios del norte: mover etiqueta debajo del marcador.
  const isNorthEdge = lat > 18.42;
  const rectY = isNorthEdge ? 12 : -24;
  const textY = rectY + 8.5;

  return { rectX, rectY, textX, textY };
}

export function PuertoRicoMap({ cooperatives }: Props) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeMunicipalityCode, setActiveMunicipalityCode] = useState<string | null>(null);
  const [compactMapLabel, setCompactMapLabel] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");

    const apply = () => {
      setCompactMapLabel(media.matches);
    };

    apply();
    media.addEventListener("change", apply);

    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);

  /** Set of municipality codes that have at least one cooperative */
  const activeMunicipalities = new Set(cooperatives.map((c) => c.municipalityCode));

  /** Group cooperatives by municipality for the markers */
  const coopsByMunicipality = cooperatives.reduce<
    Record<string, CooperativeListItem[]>
  >((acc, coop) => {
    if (!acc[coop.municipalityCode]) acc[coop.municipalityCode] = [];
    acc[coop.municipalityCode].push(coop);
    return acc;
  }, {});

  const handleMarkerClick = (coop: CooperativeListItem) => {
    if (activeSlug === coop.slug) {
      router.push(`/cooperativas/${coop.slug}`);
    } else {
      setActiveSlug(coop.slug);
      setActiveMunicipalityCode(coop.municipalityCode);
      setTooltip({
        municipality: coop.municipalityName,
        cooperatives: [{ name: coop.name, slug: coop.slug }],
      });
    }
  };

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [-66.25, 18.2],
          scale: 17000,
        }}
        width={800}
        height={380}
        style={{ width: "100%", height: "auto" }}
        viewBox="0 0 800 380"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = fipsToMunicipalityCode[String(geo.id)];
              const hasCoops = code ? activeMunicipalities.has(code) : false;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: hasCoops ? "#003024" : "#c8d4c8",
                      stroke: "#ffffff",
                      strokeWidth: 0.6,
                      outline: "none",
                    },
                    hover: {
                      fill: hasCoops ? "#00482e" : "#a8bca8",
                      stroke: "#ffffff",
                      strokeWidth: 0.6,
                      outline: "none",
                    },
                    pressed: {
                      fill: hasCoops ? "#003024" : "#a8bca8",
                      stroke: "#ffffff",
                      strokeWidth: 0.6,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Cooperative markers — one per municipality (grouped) */}
        {Object.entries(coopsByMunicipality).map(([code, coops]) => {
          const coords = municipalityCentroids[code];
          if (!coords) return null;
          const isMultiple = coops.length > 1;
          const labelText = compactMapLabel
            ? `${coops.length} ${coops.length === 1 ? "coop." : "coops."}`
            : `${coops.length} ${coops.length === 1 ? "cooperativa" : "cooperativas"}`;
          const labelWidth = getLabelWidth(labelText);
          const labelLayout = getLabelLayout(coords, labelWidth);

          return (
            <Marker
              key={code}
              coordinates={coords}
              onClick={() => {
                if (coops.length === 1) {
                  handleMarkerClick(coops[0]);
                } else {
                  setTooltip({
                    municipality: coops[0].municipalityName,
                    cooperatives: coops
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name, "es"))
                      .map((coop) => ({ name: coop.name, slug: coop.slug })),
                  });
                  setActiveMunicipalityCode(code);
                  setActiveSlug(null);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <circle
                r={isMultiple ? 9 : 7}
                fill={activeSlug && coops.some((c) => c.slug === activeSlug) ? "#fffe00" : "#a5ec48"}
                stroke="#003024"
                strokeWidth={2}
              />
              {isMultiple && (
                <text
                  textAnchor="middle"
                  dy="3.5"
                  style={{
                    fill: "#003024",
                    fontSize: "7px",
                    fontWeight: "700",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {coops.length}
                </text>
              )}

                {activeMunicipalityCode === code && (
                  <>
                    <rect
                      x={labelLayout.rectX}
                      y={labelLayout.rectY}
                      width={labelWidth}
                      height={12}
                      rx={6}
                      fill="#003024"
                      opacity={0.92}
                    />
                    <text
                      textAnchor="start"
                      x={labelLayout.textX}
                      y={labelLayout.textY}
                      style={{
                        fill: "#ffffff",
                        fontSize: "6px",
                        fontWeight: "700",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      {labelText}
                    </text>
                  </>
                )}
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip panel */}
      {tooltip && (
        <div
          className="mt-3 rounded-xl border px-4 py-3"
          style={{
            backgroundColor: "#fff",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--verde-impulso)" }}>
                {tooltip.cooperatives.length} cooperativas
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {tooltip.municipality}
              </p>
            </div>
            <button
              onClick={() => {
                setTooltip(null);
                setActiveSlug(null);
                  setActiveMunicipalityCode(null);
              }}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <ul className="max-h-48 overflow-auto divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {tooltip.cooperatives.map((coop) => (
                <li
                  key={coop.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/cooperativas/${coop.slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/cooperativas/${coop.slug}`);
                    }
                  }}
                  className="flex items-center justify-between gap-3 py-2 rounded-md px-1.5 cursor-pointer transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-verde-impulso"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p className="min-w-0 flex-1 text-left text-sm">
                    {coop.name}
                  </p>
                <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/cooperativas/${coop.slug}`);
                    }}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--verde-impulso)", color: "#fff" }}
                >
                  Ver perfil →
                </button>
              </li>
            ))}
          </ul>

          {tooltip.cooperatives.length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No hay cooperativas para mostrar.
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#003024" }} />
          Municipio con cooperativas
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full border-2"
            style={{ backgroundColor: "#a5ec48", borderColor: "#003024" }}
          />
          Cooperativa
        </span>
      </div>
    </div>
  );
}
