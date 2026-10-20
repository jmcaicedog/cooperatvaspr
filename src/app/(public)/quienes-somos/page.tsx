import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Conoce qué es una cooperativa y qué propone el cooperativismo, además de la misión del directorio cooperativas.pr.",
};

export default function QuienesSomosPage() {
  return (
    <div>
      {/* Page header */}
      <div
        className="w-full py-14 px-4 text-center"
        style={{ background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)` }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Quiénes somos</h1>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          La plataforma digital de cooperativas de Puerto Rico
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 flex flex-col gap-10">
        {/* Mission */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--verde-impulso)" }}>
            Nuestra misión
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <strong>cooperativas.pr</strong> es el directorio oficial de cooperativas en Puerto Rico.
            Nuestro propósito es visibilizar el movimiento cooperativo boricua, conectar a los
            ciudadanos con las organizaciones que transforman su comunidad y ofrecer a cada
            cooperativa un espacio digital digno donde presentar sus servicios.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Este directorio es una iniciativa del Fondo de Inversión y Desarrollo Cooperativo
            (FIDECOOP), una corporación sin fines de lucro creada por el Movimiento Cooperativo
            puertorriqueño y cuenta con el apoyo de múltiples organismos centrales del cooperativismo.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--verde-impulso)" }}>
              ¿Qué es una cooperativa?
            </h2>
            <blockquote className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Una cooperativa es una asociación autónoma de personas que se unen voluntariamente
              para hacer frente a sus necesidades y aspiraciones económicas, sociales y culturales
              comunes mediante una empresa de propiedad conjunta controlada democráticamente.
            </blockquote>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              (Declaración de Identidad Cooperativa, Alianza Cooperativa Internacional, Manchester,
              1995)
            </p>
          </article>

          <article
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--verde-impulso)" }}>
              ¿Qué es el cooperativismo?
            </h2>
            <blockquote className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              El cooperativismo es un sistema socioeconómico que busca la liberación, y facilita
              el perfeccionamiento integral del ser humano, mediante la justicia económica y la
              cooperación social. Es una doctrina socioeconómica basada en valores y principios
              cuyo fin es construir una sociedad más justa, social y económicamente.
            </blockquote>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              (Ley General de Sociedades Cooperativas. Ley 239, 1 de sept. de 2004).
            </p>
          </article>
        </section>

        {/* Call to action */}
        <section
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--verde-impulso)" }}
        >
          <h2 className="text-xl font-bold text-white mb-2">¿Tienes una cooperativa?</h2>
          <p className="text-white/70 text-sm mb-6">
            Registra tu cooperativa y aparece en el directorio. Es gratis y fácil.
          </p>
          <a
            href="/contacto"
            className="inline-flex items-center rounded-xl px-6 py-3 font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--verde-cooperativo)", color: "var(--verde-impulso)" }}
          >
            Contáctanos
          </a>
        </section>
      </div>
    </div>
  );
}
