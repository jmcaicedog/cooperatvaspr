"use client";

import { useActionState } from "react";

import {
  createCooperativeAction,
  type CooperativeActionState,
} from "@/app/(admin)/admin/cooperatives/actions";
import { cooperativeTypeLabels, cooperativeTypeValues } from "@/lib/cooperative-taxonomy";

const initialState: CooperativeActionState = {
  ok: false,
  message: "",
};

type MunicipalityOption = {
  code: string;
  name: string;
};

export function CooperativeCreateForm({ municipalities }: { municipalities: MunicipalityOption[] }) {
  const [state, action, pending] = useActionState(createCooperativeAction, initialState);

  return (
    <form action={action} className="admin-themed admin-card grid gap-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#2f5f51" }}>
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
        <span>Municipio</span>
        <select
          className="rounded-md border border-zinc-300 px-3 py-2"
          defaultValue=""
          name="municipalityCode"
          required
        >
          <option disabled value="">
            Selecciona un municipio
          </option>
          {municipalities.map((municipality) => (
            <option key={municipality.code} value={municipality.code}>
              {municipality.name}
            </option>
          ))}
        </select>
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

      <fieldset className="grid gap-2 text-sm">
        <legend className="text-sm">Tipo de cooperativa</legend>
        <div className="grid gap-2 rounded-md border border-zinc-300 p-3">
          {cooperativeTypeValues.map((cooperativeType) => (
            <label className="inline-flex items-center gap-2" key={cooperativeType}>
              <input name="cooperativeTypes" type="checkbox" value={cooperativeType} />
              <span>{cooperativeTypeLabels[cooperativeType]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-1 text-sm">
        <span>Palabras clave (tags)</span>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2"
          name="tags"
          placeholder="Ej. cafe, turismo, agroecologia"
        />
        <span className="text-xs text-zinc-500">Separa cada palabra clave por coma.</span>
      </label>

      <button
        className="admin-btn-primary inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
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