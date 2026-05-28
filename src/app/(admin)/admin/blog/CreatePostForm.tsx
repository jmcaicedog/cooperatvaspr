"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createPostAction } from "./actions";
import type { BlogActionState } from "./actions";
import {
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";

type Category = { id: string; name: string };

const initialState: BlogActionState = { ok: false, message: "" };

export function CreatePostForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createPostAction, initialState);

  useEffect(() => {
    if (state.ok) router.push("/admin/blog");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="admin-themed space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <AdminLabel>
            Título <span className="text-red-500">*</span>
          </AdminLabel>
          <AdminInput
            type="text"
            name="title"
            required
            placeholder="Ej. Cooperativas transforman comunidades"
          />
        </div>
        <div>
          <AdminLabel>
            Categoría <span className="text-red-500">*</span>
          </AdminLabel>
          <AdminSelect
            name="categoryId"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>

      <div>
        <AdminLabel>Extracto</AdminLabel>
        <AdminTextarea
          name="excerpt"
          rows={2}
          maxLength={400}
          placeholder="Breve descripción del artículo (visible en listados)"
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
          {isPending ? "Creando…" : "Crear artículo"}
        </AdminButton>
      </div>
    </form>
  );
}
