"use client";

import { useActionState } from "react";

import {
  assignExistingUserAction,
  createCoopAdminUserAction,
  type AdminUserActionState,
} from "@/app/(admin)/admin/users/actions";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
} from "@/components/admin/ui";

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
    <div className="admin-themed grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AdminCard className="grid gap-3 p-4">
        <form action={createAction} className="grid gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
          Crear usuario de cooperativa
        </h3>

        <AdminInput
          name="displayName"
          placeholder="Nombre completo"
          required
        />
        <AdminInput
          name="email"
          placeholder="correo@dominio.com"
          required
          type="email"
        />
        <AdminInput
          name="password"
          placeholder="Contraseña inicial"
          required
          type="password"
        />
        <AdminSelect name="cooperativeId" required>
          <option value="">Selecciona cooperativa</option>
          {cooperatives.map((cooperative) => (
            <option key={cooperative.id} value={cooperative.id}>
              {cooperative.name} (/{cooperative.slug})
            </option>
          ))}
        </AdminSelect>

        <AdminButton
          className="rounded-md px-4 py-2"
          disabled={createPending}
          type="submit"
        >
          {createPending ? "Creando..." : "Crear y asignar"}
        </AdminButton>

        {createState.message ? (
          <p className={`text-sm ${createState.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {createState.message}
          </p>
        ) : null}
        </form>
      </AdminCard>

      <AdminCard className="grid gap-3 p-4">
        <form action={assignAction} className="grid gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
          Asignar usuario existente
        </h3>

        <AdminInput
          name="email"
          placeholder="correo existente"
          required
          type="email"
        />
        <AdminSelect name="cooperativeId" required>
          <option value="">Selecciona cooperativa</option>
          {cooperatives.map((cooperative) => (
            <option key={cooperative.id} value={cooperative.id}>
              {cooperative.name} (/{cooperative.slug})
            </option>
          ))}
        </AdminSelect>

        <AdminButton
          className="rounded-md px-4 py-2"
          variant="secondary"
          disabled={assignPending}
          type="submit"
        >
          {assignPending ? "Asignando..." : "Asignar usuario"}
        </AdminButton>

        {assignState.message ? (
          <p className={`text-sm ${assignState.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {assignState.message}
          </p>
        ) : null}
        </form>
      </AdminCard>
    </div>
  );
}