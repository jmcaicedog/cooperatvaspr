"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  name: string;
  municipality: string;
  slug: string;
} | null;

export function PuertoRicoMap({ cooperatives }: Props) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

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
      setTooltip({
        name: coop.name,
        municipality: coop.municipalityName,
        slug: coop.slug,
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

          return (
            <Marker
              key={code}
              coordinates={coords}
              onClick={() => {
                if (coops.length === 1) {
                  handleMarkerClick(coops[0]);
                } else {
                  setTooltip({
                    name: `${coops.length} cooperativas`,
                    municipality: coops[0].municipalityName,
                    slug: coops[0].slug,
                  });
                  setActiveSlug(coops[0].slug);
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
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip panel */}
      {tooltip && (
        <div
          className="mt-3 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
          style={{
            backgroundColor: "#fff",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--verde-impulso)" }}>
              {tooltip.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {tooltip.municipality}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTooltip(null);
                setActiveSlug(null);
              }}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => router.push(`/cooperativas/${tooltip.slug}`)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--verde-impulso)", color: "#fff" }}
            >
              Ver perfil →
            </button>
          </div>
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
