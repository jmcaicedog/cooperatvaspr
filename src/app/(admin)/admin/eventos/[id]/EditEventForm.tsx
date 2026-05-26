"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";

import { RichTextEditor } from "@/app/cooperativa/perfil/RichTextEditor";

import {
  deleteEventAction,
  removeEventCoverAction,
  togglePublishEventAction,
  updateEventAction,
  uploadEventCoverAction,
} from "../actions";
import type { EventActionState } from "../actions";

type Event = {
  id: string;
  title: string;
  location: string;
  descriptionHtml: string | null;
  descriptionText: string | null;
  coverImageUrl: string | null;
  startsAt: Date;
  endsAt: Date | null;
  infoUrl: string | null;
  isPublished: boolean;
};

const initial: EventActionState = { ok: false, message: "" };

function toDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditEventForm({ event }: { event: Event }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [saveState, saveAction, isSaving] = useActionState(updateEventAction, initial);
  const [publishState, publishAction, isPublishing] = useActionState(
    togglePublishEventAction,
    initial,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteEventAction, initial);
  const [uploadState, uploadAction, isUploading] = useActionState(uploadEventCoverAction, initial);
  const [removeCoverState, removeCoverAction, isRemovingCover] = useActionState(
    removeEventCoverAction,
    initial,
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Columna principal */}
      <div className="space-y-6 xl:col-span-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Información del evento</h2>
          <form action={saveAction} className="space-y-4">
            <input type="hidden" name="id" value={event.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={event.title}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={event.location}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  required
                  defaultValue={toDateTimeLocal(event.startsAt)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Fin{" "}
                  <span className="text-xs font-normal text-zinc-400">(opcional)</span>
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  defaultValue={toDateTimeLocal(event.endsAt)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Enlace a más información{" "}
                <span className="text-xs font-normal text-zinc-400">(opcional)</span>
              </label>
              <input
                type="url"
                name="infoUrl"
                defaultValue={event.infoUrl ?? ""}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">Descripción</label>
              <RichTextEditor
                name="description"
                defaultHtml={event.descriptionHtml ?? ""}
                defaultText={event.descriptionText ?? ""}
              />
            </div>

            {saveState.message && (
              <p
                className={`rounded-md px-3 py-2 text-sm ${saveState.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
              >
                {saveState.message}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Columna lateral */}
      <div className="space-y-4">
        {/* Estado */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Estado</h2>
          <div className="mb-4">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${event.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}
            >
              {event.isPublished ? "Publicado" : "Borrador"}
            </span>
          </div>
          <div className="space-y-2">
            <form action={publishAction}>
              <input type="hidden" name="id" value={event.id} />
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                {isPublishing
                  ? "…"
                  : event.isPublished
                    ? "Despublicar"
                    : "Publicar"}
              </button>
            </form>
            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (!confirm("¿Eliminar este evento? Esta acción no se puede deshacer.")) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={event.id} />
              <button
                type="submit"
                disabled={isDeleting}
                className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? "…" : "Eliminar evento"}
              </button>
            </form>
          </div>
          {(publishState.message || deleteState.message) && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {publishState.message || deleteState.message}
            </p>
          )}
        </section>

        {/* Imagen de portada */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Imagen del evento</h2>

          {event.coverImageUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200">
                <Image
                  src={event.coverImageUrl}
                  alt="Imagen del evento"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <form action={removeCoverAction}>
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  disabled={isRemovingCover}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isRemovingCover ? "…" : "Eliminar imagen"}
                </button>
              </form>
              {removeCoverState.message && !removeCoverState.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {removeCoverState.message}
                </p>
              )}
            </div>
          ) : (
            <form action={uploadAction} className="space-y-3">
              <input type="hidden" name="id" value={event.id} />
              <input
                ref={fileInputRef}
                type="file"
                name="cover"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Buscar archivo
                </button>
                <span className="truncate text-xs text-zinc-500">
                  {fileName ?? "Sin archivo seleccionado"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">JPG, PNG o WEBP — máx. 5 MB</p>
              {uploadState.message && (
                <p
                  className={`rounded-md px-3 py-2 text-xs ${uploadState.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {uploadState.message}
                </p>
              )}
              <button
                type="submit"
                disabled={isUploading || !fileName}
                className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {isUploading ? "Subiendo…" : "Subir imagen"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
