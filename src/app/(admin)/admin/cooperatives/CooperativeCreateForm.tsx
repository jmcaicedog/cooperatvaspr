"use client";

import { useActionState } from "react";

import {
  createCooperativeAction,
  type CooperativeActionState,
} from "@/app/(admin)/admin/cooperatives/actions";

const initialState: CooperativeActionState = {
  ok: false,
  message: "",
};

export function CooperativeCreateForm() {
  const [state, action, pending] = useActionState(createCooperativeAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
        Crear cooperativa
      </h3>

      <label className="grid gap-1 text-sm">
        <span>Nombre</span>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2"
          name="name"
          placeholder="Ej. Cooperativa ABC"
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Código de municipio</span>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2"
          name="municipalityCode"
          placeholder="Ej. san-juan"
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Slogan</span>
        <input className="rounded-md border border-zinc-300 px-3 py-2" name="slogan" />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Descripción breve</span>
        <textarea
          className="min-h-28 rounded-md border border-zinc-300 px-3 py-2"
          name="descriptionText"
        />
      </label>

      <button
        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando..." : "Crear cooperativa"}
      </button>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}