"use client";

import { useMemo, useState } from "react";

type BranchMapPanelProps = {
  cooperativeName: string;
  branches: Array<{
    id: string;
    label: string | null;
    address: string;
    municipality: { name: string };
  }>;
};

function getMapEmbedSrc(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function BranchMapPanel({ cooperativeName, branches }: BranchMapPanelProps) {
  const [activeBranchId, setActiveBranchId] = useState(branches[0]?.id ?? null);

  const activeBranch = useMemo(
    () => branches.find((branch) => branch.id === activeBranchId) ?? branches[0] ?? null,
    [activeBranchId, branches],
  );

  if (!activeBranch) {
    return null;
  }

  return (
    <section>
      <SectionHeading>Ubicación</SectionHeading>

      {branches.length > 1 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {branches.map((branch) => {
            const isActive = branch.id === activeBranch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => setActiveBranchId(branch.id)}
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--verde-impulso)",
                        borderColor: "var(--verde-impulso)",
                        color: "#fff",
                      }
                    : {
                        backgroundColor: "#fff",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                {branch.label?.trim() || branch.municipality.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
        <iframe
          title={`Mapa de ${cooperativeName}`}
          src={getMapEmbedSrc(activeBranch.address)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full border-0"
        />
      </div>

      <div className="mt-3 rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--verde-impulso)" }}>
          {activeBranch.label?.trim() || activeBranch.municipality.name}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {activeBranch.municipality.name}
        </p>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
          {activeBranch.address}
        </p>
      </div>
    </section>
  );
}

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