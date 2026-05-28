"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createEventAction } from "./actions";
import type { EventActionState } from "./actions";

const initialState: EventActionState = { ok: false, message: "" };

export function CreateEventForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createEventAction, initialState);

  useEffect(() => {
    if (state.ok) router.push("/admin/eventos");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="admin-themed space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nombre del evento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ej. Feria de Cooperativas 2026"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Ubicación <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            required
            placeholder="Ej. Centro de Convenciones, San Juan"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="startsAt"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Fin{" "}
            <span className="text-xs font-normal text-zinc-400">(opcional — para eventos de varios días)</span>
          </label>
          <input
            type="datetime-local"
            name="endsAt"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Enlace a más información{" "}
          <span className="text-xs font-normal text-zinc-400">(opcional)</span>
        </label>
        <input
          type="url"
          name="infoUrl"
          placeholder="https://..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {state.message && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="admin-btn-primary rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Creando…" : "Crear evento"}
        </button>
      </div>
    </form>
  );
}
