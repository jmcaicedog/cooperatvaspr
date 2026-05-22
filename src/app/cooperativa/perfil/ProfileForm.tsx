"use client";

import { useActionState } from "react";

import {
  type ProfileActionState,
  updateCooperativeProfileAction,
} from "@/app/cooperativa/perfil/actions";
import { RichTextEditor } from "@/app/cooperativa/perfil/RichTextEditor";

type CooperativeProfileData = {
  id: string;
  name: string;
  municipalityCode: string;
  slogan: string | null;
  descriptionText: string | null;
  descriptionRich: unknown;
};

const initialState: ProfileActionState = {
  ok: false,
  message: "",
};

export function ProfileForm({ cooperative }: { cooperative: CooperativeProfileData }) {
  const [state, action, pending] = useActionState(updateCooperativeProfileAction, initialState);

  const rich =
    cooperative.descriptionRich &&
    typeof cooperative.descriptionRich === "object" &&
    "html" in cooperative.descriptionRich &&
    "text" in cooperative.descriptionRich
      ? (cooperative.descriptionRich as { html: string; text: string })
      : { html: cooperative.descriptionText ?? "", text: cooperative.descriptionText ?? "" };

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
        <span>Descripción breve (texto plano)</span>
        <textarea
          className="min-h-28 rounded-md border border-zinc-300 px-3 py-2"
          defaultValue={cooperative.descriptionText ?? ""}
          name="descriptionText"
        />
      </label>

      <div className="grid gap-1 text-sm">
        <span>Descripción enriquecida</span>
        <RichTextEditor
          defaultHtml={rich.html}
          defaultText={rich.text}
          name="descriptionRich"
        />
      </div>

      <button
        className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}