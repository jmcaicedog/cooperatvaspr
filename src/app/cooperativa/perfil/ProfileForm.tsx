"use client";

import { useActionState } from "react";
import Image from "next/image";

import {
  addCooperativeGalleryImageAction,
  deleteCooperativeGalleryImageAction,
  removeCooperativeLogoAction,
  setPrimaryCooperativeGalleryImageAction,
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
  gallery: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
  }>;
};

const initialState: ProfileActionState = {
  ok: false,
  message: "",
};

export function ProfileForm({ cooperative }: { cooperative: CooperativeProfileData }) {
  const [state, action, pending] = useActionState(updateCooperativeProfileAction, initialState);
  const [logoState, logoAction, logoPending] = useActionState(uploadCooperativeLogoAction, initialState);
  const [galleryState, galleryAction, galleryPending] = useActionState(
    addCooperativeGalleryImageAction,
    initialState
  );

  const galleryLimitReached = cooperative.gallery.length >= 5;

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
            <span>Codigo de municipio</span>
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

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <header className="space-y-1">
          <h2 className="text-base font-semibold">Galeria</h2>
          <p className="text-xs text-zinc-600">
            Opcional. Maximo 5 fotos por cooperativa. Formatos JPG, PNG o WEBP. Maximo 5 MB por imagen.
          </p>
          <p className="text-xs font-medium text-zinc-700">{cooperative.gallery.length}/5 imagenes</p>
        </header>

        <form action={galleryAction} className="grid gap-3 rounded-md border border-zinc-200 p-4 md:max-w-lg">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <input
            accept="image/jpeg,image/png,image/webp"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            disabled={galleryLimitReached || galleryPending}
            name="galleryFile"
            required
            type="file"
          />
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            disabled={galleryLimitReached || galleryPending}
            maxLength={200}
            name="altText"
            placeholder="Texto alternativo (opcional)"
          />
          <button
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
            disabled={galleryLimitReached || galleryPending}
            type="submit"
          >
            {galleryPending ? "Subiendo..." : "Agregar imagen"}
          </button>
          {galleryLimitReached ? (
            <p className="text-xs text-amber-700">Se alcanzo el limite de 5 imagenes.</p>
          ) : null}
        </form>

        {galleryState.message ? (
          <p className={`text-sm ${galleryState.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {galleryState.message}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cooperative.gallery.length === 0 ? (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Aun no hay imagenes cargadas.
            </article>
          ) : (
            cooperative.gallery.map((image) => (
              <article className="rounded-lg border border-zinc-200 bg-white p-3" key={image.id}>
                <div className="relative h-44 w-full overflow-hidden rounded-md bg-zinc-100">
                  <Image
                    alt={image.altText ?? "Imagen de galeria"}
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    src={image.imageUrl}
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-600">{image.altText ?? "Sin texto alternativo"}</p>
                <p className="mt-1 text-xs font-medium text-zinc-700">
                  {image.isPrimary ? "Imagen principal" : "Imagen secundaria"}
                </p>

                <div className="mt-3 flex gap-2">
                  {!image.isPrimary ? (
                    <form action={setPrimaryCooperativeGalleryImageAction}>
                      <input name="imageId" type="hidden" value={image.id} />
                      <button
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium"
                        type="submit"
                      >
                        Marcar principal
                      </button>
                    </form>
                  ) : null}

                  <form action={deleteCooperativeGalleryImageAction}>
                    <input name="imageId" type="hidden" value={image.id} />
                    <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white" type="submit">
                      Eliminar
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}