"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactFormClient() {
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    // Simulate — replace with a real Server Action or API route when ready
    await new Promise((r) => setTimeout(r, 800));
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-6">
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(165,236,72,0.2)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10l5 5 8-8" stroke="#003024" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-semibold text-sm" style={{ color: "var(--verde-impulso)" }}>
          ¡Mensaje enviado!
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Te responderemos en menos de 48 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Nombre
        </label>
        <input
          type="text"
          name="name"
          required
          disabled={state === "submitting"}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60"
          style={{ borderColor: "var(--border-subtle)" }}
          placeholder="Tu nombre completo"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Correo electrónico
        </label>
        <input
          type="email"
          name="email"
          required
          disabled={state === "submitting"}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60"
          style={{ borderColor: "var(--border-subtle)" }}
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Asunto
        </label>
        <input
          type="text"
          name="subject"
          required
          disabled={state === "submitting"}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60"
          style={{ borderColor: "var(--border-subtle)" }}
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Mensaje
        </label>
        <textarea
          name="message"
          required
          disabled={state === "submitting"}
          rows={4}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow resize-none disabled:opacity-60"
          style={{ borderColor: "var(--border-subtle)" }}
          placeholder="Cuéntanos sobre tu cooperativa o consulta…"
        />
      </div>

      {state === "error" && (
        <p className="text-xs text-red-600">
          Ocurrió un error. Intenta nuevamente o escríbenos directamente.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--verde-impulso)", color: "#fff" }}
      >
        {state === "submitting" ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
