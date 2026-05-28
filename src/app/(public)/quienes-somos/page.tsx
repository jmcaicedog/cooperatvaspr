import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Conoce la misión y visión del directorio cooperativas.pr — la plataforma de referencia para las cooperativas de Puerto Rico.",
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
            cooperativa un espacio digital digno donde presentar sus servicios y valores.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--verde-impulso)" }}>
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border p-5"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 text-lg"
                  style={{ backgroundColor: "rgba(0,48,36,0.08)" }}
                >
                  {v.icon}
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "var(--verde-impulso)" }}>
                  {v.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
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

const VALUES = [
  {
    icon: "🌿",
    title: "Comunidad",
    description:
      "Creemos en el poder de la economía solidaria para fortalecer las comunidades de Puerto Rico.",
  },
  {
    icon: "🤝",
    title: "Transparencia",
    description:
      "Información clara, accesible y actualizada sobre cada cooperativa del país.",
  },
  {
    icon: "⚡",
    title: "Innovación",
    description:
      "Tecnología moderna al servicio del movimiento cooperativo boricua.",
  },
  {
    icon: "🌱",
    title: "Inclusión",
    description:
      "Todas las cooperativas, grandes y pequeñas, tienen un espacio en nuestra plataforma.",
  },
];
