"use client";

import { useActionState } from "react";
import Image from "next/image";

import {
  removeCooperativeLogoAction,
  type ProfileActionState,
  uploadCooperativeLogoAction,
  updateCooperativeProfileAction,
} from "@/app/cooperativa/perfil/actions";
import { RichTextEditor } from "@/app/cooperativa/perfil/RichTextEditor";

type CooperativeProfileData = {
  id: string;
  name: string;
  municipalityCode: string;
  logoUrl: string | null;
  slogan: string | null;
  descriptionText: string | null;
  descriptionRich: unknown;
};

type MunicipalityOption = {
  code: string;
  name: string;
};

const initialState: ProfileActionState = {
  ok: false,
  message: "",
};

export function ProfileForm({
  cooperative,
  municipalities,
}: {
  cooperative: CooperativeProfileData;
  municipalities: MunicipalityOption[];
}) {
  const [state, action, pending] = useActionState(updateCooperativeProfileAction, initialState);
  const [logoState, logoAction, logoPending] = useActionState(uploadCooperativeLogoAction, initialState);

  const rich =
    cooperative.descriptionRich &&
    typeof cooperative.descriptionRich === "object" &&
    "html" in cooperative.descriptionRich &&
    "text" in cooperative.descriptionRich
      ? (cooperative.descriptionRich as { html: string; text: string })
      : { html: cooperative.descriptionText ?? "", text: cooperative.descriptionText ?? "" };

  return (
    <div className="space-y-6">
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
            <span>Municipio</span>
            <select
              className="rounded-md border border-zinc-300 px-3 py-2"
              defaultValue={cooperative.municipalityCode}
              name="municipalityCode"
              required
            >
              {municipalities.map((municipality) => (
                <option key={municipality.code} value={municipality.code}>
                  {municipality.name}
                </option>
              ))}
            </select>
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
          <span>Descripcion breve (texto plano)</span>
          <textarea
            className="min-h-28 rounded-md border border-zinc-300 px-3 py-2"
            defaultValue={cooperative.descriptionText ?? ""}
            name="descriptionText"
          />
        </label>

        <div className="grid gap-1 text-sm">
          <span>Descripcion enriquecida</span>
          <RichTextEditor defaultHtml={rich.html} defaultText={rich.text} name="descriptionRich" />
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

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <header className="space-y-1">
          <h2 className="text-base font-semibold">Logo</h2>
          <p className="text-xs text-zinc-600">Opcional. Formatos JPG, PNG o WEBP. Maximo 2 MB.</p>
        </header>

        {cooperative.logoUrl ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            <Image
              alt="Logo actual"
              className="object-contain"
              fill
              sizes="112px"
              src={cooperative.logoUrl}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No hay logo cargado.</p>
        )}

        <form action={logoAction} className="grid gap-3 md:max-w-md">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <input
            accept="image/jpeg,image/png,image/webp"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            name="logoFile"
            required
            type="file"
          />
          <button
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
            disabled={logoPending}
            type="submit"
          >
            {logoPending ? "Subiendo..." : "Subir logo"}
          </button>
        </form>

        {cooperative.logoUrl ? (
          <form action={removeCooperativeLogoAction}>
            <input name="cooperativeId" type="hidden" value={cooperative.id} />
            <button
              className="inline-flex rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
              type="submit"
            >
              Quitar logo
            </button>
          </form>
        ) : null}

        {logoState.message ? (
          <p className={`text-sm ${logoState.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {logoState.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}