"use client";

import { useActionState } from "react";

import {
  createCooperativeAction,
  type CooperativeActionState,
} from "@/app/(admin)/admin/cooperatives/actions";
import { cooperativeTypeLabels, cooperativeTypeValues } from "@/lib/cooperative-taxonomy";
import {
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";

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

      <div className="grid gap-1 text-sm">
        <AdminLabel className="mb-0">Nombre</AdminLabel>
        <AdminInput
          name="name"
          placeholder="Ej. Cooperativa ABC"
          required
        />
      </div>

      <div className="grid gap-1 text-sm">
        <AdminLabel className="mb-0">Municipio</AdminLabel>
        <AdminSelect
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
        </AdminSelect>
      </div>

      <div className="grid gap-1 text-sm">
        <AdminLabel className="mb-0">Slogan</AdminLabel>
        <AdminInput name="slogan" />
      </div>

      <div className="grid gap-1 text-sm">
        <AdminLabel className="mb-0">Año de fundación</AdminLabel>
        <AdminInput max={new Date().getFullYear()} min={1700} name="foundedYear" placeholder="Ej. 1968" type="number" />
      </div>

      <div className="grid gap-1 text-sm">
        <AdminLabel className="mb-0">Descripción breve</AdminLabel>
        <AdminTextarea className="min-h-28" name="descriptionText" />
      </div>

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

      <div className="grid gap-1 text-sm">
        <AdminLabel className="mb-0">Palabras clave (tags)</AdminLabel>
        <AdminInput
          name="tags"
          placeholder="Ej. cafe, turismo, agroecologia"
        />
        <span className="text-xs text-zinc-500">Separa cada palabra clave por coma.</span>
      </div>

      <AdminButton
        className="rounded-md px-4 py-2"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando..." : "Crear cooperativa"}
      </AdminButton>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}