"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cooperativeTypeLabels, cooperativeTypeValues } from "@/lib/cooperative-taxonomy";
import { CooperativeCard, type CooperativeListItem } from "./CooperativeCard";

const PuertoRicoMap = dynamic(
  () => import("./PuertoRicoMap").then((m) => m.PuertoRicoMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

type Props = {
  cooperatives: CooperativeListItem[];
  municipalities: Array<{ code: string; name: string }>;
};

type ViewMode = "cards" | "map";
const PAGE_SIZE = 12;

function parseListParam(raw: string | null): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

export function CooperativeDirectory({ cooperatives, municipalities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cooperativeTypeSet = useMemo(() => new Set<string>(cooperativeTypeValues), []);

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedMunicipality, setSelectedMunicipality] = useState(() => searchParams.get("muni") ?? "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() =>
    parseListParam(searchParams.get("types")).filter((type) => cooperativeTypeSet.has(type))
  );
  const [view, setView] = useState<ViewMode>(() => (searchParams.get("view") === "map" ? "map" : "cards"));
  const [selectedTags, setSelectedTags] = useState<string[]>(() => parseListParam(searchParams.get("tags")));
  const [currentPage, setCurrentPage] = useState(() => {
    const raw = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  });

  const allTags = useMemo(() => {
    const set = new Set<string>();
    cooperatives.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [cooperatives]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return cooperatives.filter((c) => {
      if (q) {
        const haystack = [
          c.name,
          c.municipalityName,
          ...c.searchableMunicipalityNames,
          c.slogan ?? "",
          ...c.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedMunicipality && !c.municipalityCodes.includes(selectedMunicipality)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.every((t) => c.cooperativeTypes.includes(t)))
        return false;
      if (selectedTags.length > 0 && !selectedTags.every((t) => c.tags.includes(t)))
        return false;
      return true;
    });
  }, [cooperatives, search, selectedMunicipality, selectedTypes, selectedTags]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next =
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      setCurrentPage(1);
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next =
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      setCurrentPage(1);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedMunicipality("");
    setSelectedTypes([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search || selectedMunicipality || selectedTypes.length > 0 || selectedTags.length > 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const pagedCooperatives = filtered.slice(startIndex, endIndex);

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    setCurrentPage(clamped);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");

      if (selectedMunicipality) params.set("muni", selectedMunicipality);
      else params.delete("muni");

      if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
      else params.delete("types");

      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      else params.delete("tags");

      if (currentPageSafe > 1) params.set("page", String(currentPageSafe));
      else params.delete("page");

      const currentQuery = searchParams.toString();
      const nextQuery = params.toString();
      if (nextQuery !== currentQuery) {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [
    search,
    selectedMunicipality,
    selectedTypes,
    selectedTags,
    currentPageSafe,
    pathname,
    router,
    searchParams,
  ]);

  const paginationNumbers = useMemo(() => {
    const pages = new Set<number>([1, totalPages, currentPageSafe - 1, currentPageSafe, currentPageSafe + 1]);

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPageSafe, totalPages]);

  return (
    <section id="directorio" className="w-full">
      {/* Search & filter bar */}
      <div
        className="rounded-2xl border p-4 sm:p-5 mb-6"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
      >
        {/* Search input */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar cooperativa, municipio, servicio…"
            className="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
              backgroundColor: "#fff",
            }}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          {/* Municipality dropdown */}
          <select
            value={selectedMunicipality}
            onChange={(e) => {
              setSelectedMunicipality(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 flex-1 min-w-40"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          >
            <option value="">Todos los municipios</option>
            {municipalities.map((m) => (
              <option key={m.code} value={m.code}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {cooperativeTypeValues.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={
                  selectedTypes.includes(type)
                    ? {
                        backgroundColor: "var(--verde-impulso)",
                        borderColor: "var(--verde-impulso)",
                        color: "#fff",
                      }
                    : {
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-secondary)",
                        backgroundColor: "transparent",
                      }
                }
              >
                {cooperativeTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Tag pills (only show if tags exist) */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="text-xs self-center mr-1" style={{ color: "var(--text-muted)" }}>
              Etiquetas:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="rounded-full border px-2.5 py-0.5 text-xs transition-colors"
                style={
                  selectedTags.includes(tag)
                    ? {
                        backgroundColor: "var(--azul-compromiso)",
                        borderColor: "var(--azul-compromiso)",
                        color: "#fff",
                      }
                    : {
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-muted)",
                        backgroundColor: "transparent",
                      }
                }
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {`${filtered.length} de ${cooperatives.length}`}
          </p>
          {view === "cards" && filtered.length > 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Mostrando {startIndex + 1}-{endIndex}
            </p>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs underline transition-opacity hover:opacity-70"
              style={{ color: "var(--azul-compromiso)" }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <ViewToggleButton
            active={view === "cards"}
            onClick={() => setView("cards")}
            aria-label="Vista de tarjetas"
          >
            <GridIcon />
            <span className="hidden sm:inline text-xs ml-1.5">Tarjetas</span>
          </ViewToggleButton>
          <ViewToggleButton
            active={view === "map"}
            onClick={() => setView("map")}
            aria-label="Vista de mapa"
          >
            <MapIcon />
            <span className="hidden sm:inline text-xs ml-1.5">Mapa</span>
          </ViewToggleButton>
        </div>
      </div>

      {/* Content */}
      {view === "cards" ? (
        filtered.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {pagedCooperatives.map((coop) => (
                <CooperativeCard key={coop.id} coop={coop} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Paginación cooperativas">
                <button
                  onClick={() => goToPage(currentPageSafe - 1)}
                  disabled={currentPageSafe === 1}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                >
                  Anterior
                </button>

                {paginationNumbers.map((page, index) => {
                  const prevPage = paginationNumbers[index - 1];
                  const shouldShowEllipsis = prevPage && page - prevPage > 1;
                  return (
                    <div key={page} className="flex items-center gap-1.5">
                      {shouldShowEllipsis && (
                        <span className="px-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className="min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                        style={
                          page === currentPageSafe
                            ? {
                                borderColor: "var(--verde-impulso)",
                                backgroundColor: "var(--verde-impulso)",
                                color: "#fff",
                              }
                            : {
                                borderColor: "var(--border-subtle)",
                                color: "var(--text-secondary)",
                                backgroundColor: "transparent",
                              }
                        }
                        aria-current={page === currentPageSafe ? "page" : undefined}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => goToPage(currentPageSafe + 1)}
                  disabled={currentPageSafe === totalPages}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )
      ) : (
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          <PuertoRicoMap cooperatives={filtered} />
        </div>
      )}
    </section>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function ViewToggleButton({
  active,
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center px-3 py-2 text-sm transition-colors"
      style={
        active
          ? { backgroundColor: "var(--verde-impulso)", color: "#fff" }
          : { backgroundColor: "transparent", color: "var(--text-secondary)" }
      }
    >
      {children}
    </button>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--border-subtle)" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <circle cx="13" cy="13" r="8" stroke="#003024" strokeWidth="1.5" />
          <path d="M19 19l5 5" stroke="#003024" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 13h6M13 10v6" stroke="#003024" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-medium text-sm" style={{ color: "var(--text-secondary)" }}>
        No encontramos cooperativas con esos criterios
      </p>
      <button
        onClick={onClear}
        className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
        style={{ backgroundColor: "var(--verde-impulso)", color: "#fff" }}
      >
        Ver todas las cooperativas
      </button>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div
      className="h-72 w-full animate-pulse rounded-xl"
      style={{ backgroundColor: "#e8f0e8" }}
      aria-label="Cargando mapa…"
    />
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M1 3l5-2 4 2 5-2v10l-5 2-4-2-5 2V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 1v10M10 3v10" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
