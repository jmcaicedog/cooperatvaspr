import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con el equipo de cooperativas.pr.",
};

export default function ContactoPage() {
  return (
    <div>
      {/* Page header */}
      <div
        className="w-full py-14 px-4 text-center"
        style={{ background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)` }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Contacto</h1>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          ¿Tienes preguntas o deseas registrar tu cooperativa?
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Info column */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--verde-impulso)" }}>
              Estamos aquí para ayudarte
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Si representas una cooperativa y deseas aparecer en el directorio, o tienes
              preguntas sobre la plataforma, escríbenos. Respondemos en menos de 48 horas.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(0,48,36,0.08)" }}
                >
                  <span className="text-sm">{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm hover:underline"
                      style={{ color: "var(--azul-compromiso)" }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form column */}
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
        >
          <h2 className="text-base font-bold mb-5" style={{ color: "var(--verde-impulso)" }}>
            Envíanos un mensaje
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

/* ─── Contact form (client component) ──────────────────────────────── */
import { ContactFormClient } from "./ContactFormClient";

function ContactForm() {
  return <ContactFormClient />;
}

const CONTACT_ITEMS = [
  {
    icon: "✉️",
    label: "Correo",
    value: "hola@cooperativas.pr",
    href: "mailto:hola@cooperativas.pr",
  },
  {
    icon: "📍",
    label: "Ubicación",
    value: "Puerto Rico",
    href: null,
  },
  {
    icon: "🕐",
    label: "Horario de respuesta",
    value: "Lunes a viernes, 9am – 5pm AST",
    href: null,
  },
];
