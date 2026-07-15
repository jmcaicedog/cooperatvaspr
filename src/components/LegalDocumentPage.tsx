import type { ReactNode } from "react";

export function LegalDocumentPage({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div>
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "#edf4ed" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,191,237,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(165,236,72,0.24),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--verde-impulso)]/70">
              Legal document
            </p>
            <h1
              className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl"
              style={{ color: "var(--verde-impulso)" }}
            >
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
            <div className="mt-6 inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]" style={{ borderColor: "rgba(0,48,36,0.12)", color: "var(--verde-impulso)", backgroundColor: "rgba(255,255,255,0.65)" }}>
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
        <article
          className="overflow-hidden rounded-[2rem] border bg-white shadow-[0_24px_80px_rgba(0,48,36,0.08)]"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(0,48,36,0.03)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>
              Read carefully
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              By accessing the sites or submitting information, you acknowledge the terms set out below.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-8 lg:px-10">
            <div className="prose-coop max-w-none">{children}</div>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div
            className="rounded-[1.75rem] border p-6 shadow-sm"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(255,255,255,0.88)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>
              Scope
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              <li>emprendecoop.com</li>
              <li>fidecoop.coop</li>
              <li>cooperativas.pr</li>
              <li>Programs, forms, portals, and events administered by FIDECOOP</li>
            </ul>
          </div>

          <div
            className="rounded-[1.75rem] border p-6 shadow-sm"
            style={{ borderColor: "rgba(0,48,36,0.1)", backgroundColor: "var(--verde-impulso)", color: "rgba(255,255,255,0.82)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Contact</p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              FONDO DE INVERSIÓN Y DESARROLLO COOPERATIVO, INC. (FIDECOOP)
            </p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              400 Ave. Américo Miranda, Suite 302
              <br />
              San Juan, Puerto Rico 00927-5142
            </p>
            <a
              href="mailto:info@fidecoop.coop"
              className="mt-5 inline-flex text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              info@fidecoop.coop
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-24 border-t pt-8 first:border-t-0 first:pt-0" style={{ borderColor: "var(--border-subtle)" }}>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "var(--verde-impulso)" }}>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 sm:text-[0.95rem]" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </section>
  );
}
