"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createEventAction } from "./actions";
import type { EventActionState } from "./actions";
import {
  AdminButton,
  AdminInput,
  AdminLabel,
} from "@/components/admin/ui";

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
          <AdminLabel>
            Nombre del evento <span className="text-red-500">*</span>
          </AdminLabel>
          <AdminInput
            type="text"
            name="title"
            required
            placeholder="Ej. Feria de Cooperativas 2026"
          />
        </div>
        <div>
          <AdminLabel>
            Ubicación <span className="text-red-500">*</span>
          </AdminLabel>
          <AdminInput
            type="text"
            name="location"
            required
            placeholder="Ej. Centro de Convenciones, San Juan"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <AdminLabel>
            Inicio <span className="text-red-500">*</span>
          </AdminLabel>
          <AdminInput
            type="datetime-local"
            name="startsAt"
            required
          />
        </div>
        <div>
          <AdminLabel>
            Fin{" "}
            <span className="text-xs font-normal text-zinc-400">(opcional — para eventos de varios días)</span>
          </AdminLabel>
          <AdminInput
            type="datetime-local"
            name="endsAt"
          />
        </div>
      </div>

      <div>
        <AdminLabel>
          Enlace a más información{" "}
          <span className="text-xs font-normal text-zinc-400">(opcional)</span>
        </AdminLabel>
        <AdminInput
          type="url"
          name="infoUrl"
          placeholder="https://..."
        />
      </div>

      {state.message && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <div className="flex justify-end">
        <AdminButton
          type="submit"
          disabled={isPending}
          className="rounded-lg px-5 py-2"
        >
          {isPending ? "Creando…" : "Crear evento"}
        </AdminButton>
      </div>
    </form>
  );
}
