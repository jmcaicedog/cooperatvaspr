"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createPostAction } from "./actions";
import type { BlogActionState } from "./actions";

type Category = { id: string; name: string };

const initialState: BlogActionState = { ok: false, message: "" };

export function CreatePostForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createPostAction, initialState);

  useEffect(() => {
    if (state.ok) router.push("/admin/blog");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ej. Cooperativas transforman comunidades"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Extracto</label>
        <textarea
          name="excerpt"
          rows={2}
          maxLength={400}
          placeholder="Breve descripción del artículo (visible en listados)"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {state.message && !state.ok && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {isPending ? "Creando…" : "Crear artículo"}
        </button>
      </div>
    </form>
  );
}
