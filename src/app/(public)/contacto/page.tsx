import type { Metadata } from "next";
import { getPlatformSettings } from "@/lib/platform-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  return {
    title: settings.contactTitle,
    description: settings.contactIntro,
  };
}

export default async function ContactoPage() {
  const settings = await getPlatformSettings();
  const contactItems = [
    {
      icon: "✉️",
      label: "Correo",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    },
    {
      icon: "📍",
      label: "Ubicación",
      value: settings.contactLocation,
      href: null,
    },
    {
      icon: "🕐",
      label: "Horario",
      value: settings.contactHours,
      href: null,
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div
        className="w-full py-14 px-4 text-center"
        style={{ background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)` }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{settings.contactTitle}</h1>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          {settings.contactIntro}
        </p>
      </div>

      <div
        className={`mx-auto grid max-w-3xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 ${
          settings.contactFormEnabled ? "md:grid-cols-2" : ""
        }`}
      >
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
            {contactItems.map((item) => (
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
        {settings.contactFormEnabled ? (
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
          >
            <h2 className="text-base font-bold mb-5" style={{ color: "var(--verde-impulso)" }}>
              Envíanos un mensaje
            </h2>
            <ContactForm />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Contact form (client component) ──────────────────────────────── */
import { ContactFormClient } from "./ContactFormClient";

function ContactForm() {
  return <ContactFormClient />;
}
