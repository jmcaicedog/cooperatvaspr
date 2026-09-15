import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Conoce los servicios que ofrece el ecosistema cooperativo de Puerto Rico.",
};

export default function ServiciosPage() {
  return (
    <div>
      {/* Page header */}
      <div
        className="w-full py-14 px-4 text-center"
        style={{ background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)` }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Servicios</h1>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          Lo que hacen las cooperativas de Puerto Rico por su comunidad
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Una cooperativa es una asociación de personas que se unen voluntariamente para hacer frente a sus necesidades y aspiraciones económicas, sociales y culturales comunes, por medio de una empresa de propiedad conjunta y controlada democráticamente.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            En Puerto Rico, la mayoría de las cooperativas están organizadas conforme a la Ley General de Sociedades Cooperativas, la Ley de Cooperativas de Ahorro y Crédito y la Ley Especial de Cooperativas Juveniles. Otras cooperativas y organizaciones del cooperativismo cuentan tambien con su propio marco legal.
          </p>
        </section>

        {/* Service categories */}
        <section>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--verde-impulso)" }}>
            Tipos de cooperativas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COOP_TYPES.map((type) => (
              <div
                key={type.title}
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: type.color }}
                />
                <div className="p-5">
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--verde-impulso)" }}>
                    {type.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section
          className="rounded-2xl p-8"
          style={{ backgroundColor: "var(--verde-impulso)" }}
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            ¿Por qué unirte a una cooperativa?
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex flex-col items-center text-center gap-2">
                <span className="text-2xl">{b.icon}</span>
                <span className="text-sm text-white/80">{b.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Directory CTA */}
        <section className="text-center">
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--verde-impulso)" }}>
            Explora el directorio
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Encuentra la cooperativa que mejor se adapta a tus necesidades.
          </p>
          <Link
            href="/#directorio"
            className="inline-flex items-center rounded-xl px-6 py-3 font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--verde-impulso)", color: "#fff" }}
          >
            Ver todas las cooperativas →
          </Link>
        </section>
      </div>
    </div>
  );
}

const COOP_TYPES = [
  {
    color: "#0d3b66",
    title: "Ahorro y Crédito",
    description:
      "Son instituciones financieras organizadas para satisfacer las necesidades financieras de sus socios: fomentan el ahorro, reciben depósitos, ofrecen financiamiento y otros servicios financieros.",
  },
  {
    color: "#a5ec48",
    title: "Trabajo Asociado",
    description:
      "Cooperativas donde los propios trabajadores pueden ser dueños y administran democráticamente la empresa compartiendo sus beneficios y responsabilidades.",
  },
  {
    color: "#14bfed",
    title: "Consumidores y Usuarios",
    description:
      "La que ha sido creada para satisfacer las necesidades de sus socios consumidores o usuarios quienes se organizan para adquirir los bienes y servicios que la cooperativa provee, bajo condiciones más favorables.",
  },
  {
    color: "#f97316",
    title: "Mixta",
    description:
      "Son cooperativas en las que participan conjuntamente socios usuarios/consumidores y socios trabajadores, u otras categorías, compartiendo la propiedad, el control y los beneficios de la organización conforme a los principios cooperativos.",
  },
  {
    color: "#fffe00",
    title: "Vivienda",
    description:
      "La que es formada por personas o familias que se unen para desarrollar, adquirir, administrar o disfrutar de vivienda asequible de manera colectiva, siendo los propios socios quienes controlan democráticamente la entidad y se benefician de sus servicios.",
  },
  {
    color: "#003024",
    title: "Energía",
    description:
      "Sociedad cooperativa cuyos socios se organizan para desarrollar, producir, adquirir, distribuir o proveer energía y servicios eléctricos a la comunidad de manera colectiva, siendo los propios socios los dueños y administradores democráticos de la entidad.",
  },
  {
    color: "#0ea5e9",
    title: "Seguros",
    description:
      "Aseguradora organizada bajo el modelo cooperativo, propiedad de sus socios y administrada por ellos cuyo propósito es proveer seguros a sus socios y clientes conforme a los principios del cooperativismo.",
  },
  {
    color: "#ec4899",
    title: "Juveniles",
    description:
      "Las cooperativas juveniles son talleres prácticos donde los jóvenes desarrollan destrezas de liderazgo, administración, toma de decisiones y trabajo colectivo, al tiempo que satisfacen necesidades de su escuela o comunidad.",
  },
];

const BENEFITS = [
  { icon: "💰", text: "Acceso a servicios y productos a precios justos" },
  { icon: "🗳️", text: "Voz y voto en las decisiones de tu cooperativa" },
  { icon: "🌱", text: "Impacto directo en tu comunidad y el medio ambiente" },
];
