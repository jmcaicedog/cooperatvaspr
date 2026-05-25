"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";

import {
  createTestimonialAction,
  deleteTestimonialAction,
  removeAvatarAction,
  togglePublishTestimonialAction,
  updateTestimonialAction,
  uploadAvatarAction,
} from "./actions";
import type { TestimonialActionState } from "./actions";

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorOrganization: string | null;
  avatarUrl: string | null;
  body: string;
  isPublished: boolean;
  sortOrder: number;
};

const initial: TestimonialActionState = { ok: false, message: "" };

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateState, updateAction, isUpdating] = useActionState(updateTestimonialAction, initial);
  const [publishState, publishAction, isPublishing] = useActionState(
    togglePublishTestimonialAction,
    initial,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteTestimonialAction, initial);
  const [uploadState, uploadAction, isUploading] = useActionState(uploadAvatarAction, initial);
  const [removeAvatarState, removeAvatarActionState, isRemovingAvatar] = useActionState(
    removeAvatarAction,
    initial,
  );

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {testimonial.avatarUrl ? (
            <div className="group relative">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-zinc-200">
                <Image
                  src={testimonial.avatarUrl}
                  alt={testimonial.authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <form action={removeAvatarActionState} className="mt-1">
                <input type="hidden" name="id" value={testimonial.id} />
                <button
                  type="submit"
                  disabled={isRemovingAvatar}
                  className="w-full rounded text-xs text-red-500 hover:underline"
                >
                  {isRemovingAvatar ? "…" : "Quitar"}
                </button>
              </form>
              {removeAvatarState.message && !removeAvatarState.ok && (
                <p className="mt-1 text-xs text-red-600">{removeAvatarState.message}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 text-xl text-zinc-400">
                {testimonial.authorName[0].toUpperCase()}
              </div>
              <form action={uploadAction}>
                <input type="hidden" name="id" value={testimonial.id} />
                <input
                  ref={fileInputRef}
                  type="file"
                  name="avatar"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={() => {
                    fileInputRef.current?.closest("form")?.requestSubmit();
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs text-zinc-500 hover:underline disabled:opacity-50"
                >
                  {isUploading ? "…" : "Subir foto"}
                </button>
              </form>
              {uploadState.message && !uploadState.ok && (
                <p className="text-xs text-red-600">{uploadState.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="id" value={testimonial.id} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="authorName"
                    required
                    defaultValue={testimonial.authorName}
                    className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Cargo</label>
                  <input
                    type="text"
                    name="authorRole"
                    defaultValue={testimonial.authorRole ?? ""}
                    placeholder="Ej. Presidenta"
                    className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">
                    Organización
                  </label>
                  <input
                    type="text"
                    name="authorOrganization"
                    defaultValue={testimonial.authorOrganization ?? ""}
                    placeholder="Ej. CoopABC"
                    className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Testimonio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="body"
                  required
                  rows={3}
                  maxLength={800}
                  defaultValue={testimonial.body}
                  className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              {updateState.message && (
                <p
                  className={`rounded-md px-2 py-1.5 text-xs ${updateState.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {updateState.message}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {isUpdating ? "…" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900">{testimonial.authorName}</p>
                  {(testimonial.authorRole || testimonial.authorOrganization) && (
                    <p className="text-xs text-zinc-500">
                      {[testimonial.authorRole, testimonial.authorOrganization]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${testimonial.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {testimonial.isPublished ? "Activo" : "Inactivo"}
                </span>
              </div>
              <blockquote className="mt-2 text-sm text-zinc-700">
                &ldquo;{testimonial.body}&rdquo;
              </blockquote>
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      {!isEditing && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
          >
            Editar
          </button>
          <form action={publishAction}>
            <input type="hidden" name="id" value={testimonial.id} />
            <button
              type="submit"
              disabled={isPublishing}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
            >
              {isPublishing
                ? "…"
                : testimonial.isPublished
                  ? "Desactivar"
                  : "Activar"}
            </button>
          </form>
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm("¿Eliminar este testimonio?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={testimonial.id} />
            <button
              type="submit"
              disabled={isDeleting}
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? "…" : "Eliminar"}
            </button>
          </form>
          {(publishState.message || deleteState.message) && (
            <p className="w-full text-xs text-red-600">
              {publishState.message || deleteState.message}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [createState, createAction, isCreating] = useActionState(
    createTestimonialAction,
    initial,
  );

  return (
    <div className="space-y-6">
      {/* Cards existentes */}
      {testimonials.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white py-12 text-center text-sm text-zinc-400">
          Aún no hay testimonios. Crea el primero abajo.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}

      {/* Formulario nuevo testimonio */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Nuevo testimonio</h2>
        <form action={createAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="authorName"
                required
                placeholder="María González"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Cargo</label>
              <input
                type="text"
                name="authorRole"
                placeholder="Presidenta"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Organización</label>
              <input
                type="text"
                name="authorOrganization"
                placeholder="CoopABC"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Testimonio <span className="text-red-500">*</span>
            </label>
            <textarea
              name="body"
              required
              rows={3}
              maxLength={800}
              placeholder="Las cooperativas han transformado nuestra comunidad…"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="mt-1 text-xs text-zinc-400">Máximo 800 caracteres</p>
          </div>

          {createState.message && (
            <p
              className={`rounded-md px-3 py-2 text-sm ${createState.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
            >
              {createState.message}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {isCreating ? "Creando…" : "Crear testimonio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
