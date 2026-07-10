"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CooperativesSearchInputProps = {
  initialQuery: string;
};

export function CooperativesSearchInput({ initialQuery }: CooperativesSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      const currentTrimmed = (searchParams.get("q") ?? "").trim();

      // Evita navegación redundante al hidratar, refrescar o paginar.
      if (trimmed === currentTrimmed) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      params.delete("page");

      const nextQuery = params.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextHref, { scroll: false });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [pathname, query, router, searchParams]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider" htmlFor="q" style={{ color: "#5f7d72" }}>
          Buscar cooperativa
        </label>
        <input
          id="q"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre, slug o municipio"
          className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#c8dad1" }}
          type="search"
          autoComplete="off"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
          onClick={() => {
            setQuery("");
            router.replace(pathname, { scroll: false });
          }}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
