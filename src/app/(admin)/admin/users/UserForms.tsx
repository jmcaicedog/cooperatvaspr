"use client";

import { useActionState } from "react";

import {
  assignExistingUserAction,
  createCoopAdminUserAction,
  type AdminUserActionState,
} from "@/app/(admin)/admin/users/actions";

type CooperativeOption = {
  id: string;
  name: string;
  slug: string;
};

const initialState: AdminUserActionState = {
  ok: false,
  message: "",
};

export function UserForms({ cooperatives }: { cooperatives: CooperativeOption[] }) {
  const [createState, createAction, createPending] = useActionState(
    createCoopAdminUserAction,
    initialState
  );

  const [assignState, assignAction, assignPending] = useActionState(
    assignExistingUserAction,
    initialState
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <form action={createAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
          Crear usuario de cooperativa
        </h3>

        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="displayName"
          placeholder="Nombre completo"
          required
        />
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="email"
          placeholder="correo@dominio.com"
          required
          type="email"
        />
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="password"
          placeholder="Contraseña inicial"
          required
          type="password"
        />
        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" name="cooperativeId" required>
          <option value="">Selecciona cooperativa</option>
          {cooperatives.map((cooperative) => (
            <option key={cooperative.id} value={cooperative.id}>
              {cooperative.name} (/{cooperative.slug})
            </option>
          ))}
        </select>

        <button
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          disabled={createPending}
          type="submit"
        >
          {createPending ? "Creando..." : "Crear y asignar"}
        </button>

        {createState.message ? (
          <p className={`text-sm ${createState.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {createState.message}
          </p>
        ) : null}
      </form>

      <form action={assignAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
          Asignar usuario existente
        </h3>

        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="email"
          placeholder="correo existente"
          required
          type="email"
        />
        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" name="cooperativeId" required>
          <option value="">Selecciona cooperativa</option>
          {cooperatives.map((cooperative) => (
            <option key={cooperative.id} value={cooperative.id}>
              {cooperative.name} (/{cooperative.slug})
            </option>
          ))}
        </select>

        <button
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium"
          disabled={assignPending}
          type="submit"
        >
          {assignPending ? "Asignando..." : "Asignar usuario"}
        </button>

        {assignState.message ? (
          <p className={`text-sm ${assignState.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {assignState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}