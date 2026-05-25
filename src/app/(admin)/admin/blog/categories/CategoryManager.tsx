"use client";

import { useActionState, useState } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../actions";
import type { BlogActionState } from "../actions";

type Category = { id: string; name: string; slug: string; _count: { posts: number } };

const initial: BlogActionState = { ok: false, message: "" };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, isCreating] = useActionState(createCategoryAction, initial);
  const [updateState, updateAction, isUpdating] = useActionState(updateCategoryAction, initial);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteCategoryAction, initial);

  return (
    <div className="space-y-6">
      {/* Lista de categorías */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {categories.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">No hay categorías aún.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {categories.map((cat) => (
              <li key={cat.id} className="px-4 py-3">
                {editingId === cat.id ? (
                  <form action={updateAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={cat.id} />
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-zinc-600">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={cat.name}
                        required
                        className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-zinc-600">Slug</label>
                      <input
                        type="text"
                        name="slug"
                        defaultValue={cat.slug}
                        className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
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
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-zinc-900">{cat.name}</span>
                      <span className="ml-2 text-xs text-zinc-400">{cat.slug}</span>
                      <span className="ml-3 text-xs text-zinc-400">
                        {cat._count.posts} artículo(s)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(cat.id)}
                        className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
                      >
                        Editar
                      </button>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button
                          type="submit"
                          disabled={isDeleting || cat._count.posts > 0}
                          title={
                            cat._count.posts > 0
                              ? "Tiene artículos asociados"
                              : "Eliminar categoría"
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mensajes de error / éxito */}
      {updateState.message && !updateState.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{updateState.message}</p>
      )}
      {deleteState.message && !deleteState.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{deleteState.message}</p>
      )}

      {/* Crear nueva categoría */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Nueva categoría</h2>
        <form action={createAction} className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej. Noticias"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Slug <span className="text-xs text-zinc-400">(opcional, se genera automáticamente)</span>
            </label>
            <input
              type="text"
              name="slug"
              placeholder="Ej. noticias"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {isCreating ? "…" : "Crear categoría"}
          </button>
        </form>
        {createState.message && (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${createState.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            {createState.message}
          </p>
        )}
      </section>
    </div>
  );
}
