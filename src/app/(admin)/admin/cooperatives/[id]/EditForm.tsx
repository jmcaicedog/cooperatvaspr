"use client";

import { useActionState } from "react";

import {
  type CooperativeActionState,
  updateCooperativeByAdminAction,
} from "@/app/(admin)/admin/cooperatives/actions";

type CooperativeEditData = {
  id: string;
  name: string;
  municipalityCode: string;
  slogan: string | null;
  descriptionText: string | null;
};

const initialState: CooperativeActionState = {
  ok: false,
  message: "",
};

export function EditForm({ cooperative }: { cooperative: CooperativeEditData }) {
  const [state, action, pending] = useActionState(updateCooperativeByAdminAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      <input name="cooperativeId" type="hidden" value={cooperative.id} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>Nombre</span>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2"
            defaultValue={cooperative.name}
            name="name"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Código de municipio</span>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2"
            defaultValue={cooperative.municipalityCode}
            name="municipalityCode"
            required
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span>Slogan</span>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2"
          defaultValue={cooperative.slogan ?? ""}
          name="slogan"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Descripción</span>
        <textarea
          className="min-h-32 rounded-md border border-zinc-300 px-3 py-2"
          defaultValue={cooperative.descriptionText ?? ""}
          name="descriptionText"
        />
      </label>

      <button
        className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}