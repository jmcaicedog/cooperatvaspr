"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { RichTextEditor } from "@/app/cooperativa/perfil/RichTextEditor";
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";

import {
  archivePostAction,
  deletePostAction,
  publishPostAction,
  removePostCoverAction,
  updatePostAction,
  uploadPostCoverAction,
} from "../actions";
import type { BlogActionState } from "../actions";

type Category = { id: string; name: string; _count: { posts: number } };
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  bodyHtml: string | null;
  bodyText: string | null;
  coverImageUrl: string | null;
  status: string;
  categoryId: string;
  publishedAt: Date | null;
};

const initial: BlogActionState = { ok: false, message: "" };

export function EditPostForm({
  post,
  categories,
}: {
  post: Post;
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [saveState, saveAction, isSaving] = useActionState(updatePostAction, initial);
  const [publishState, publishAction, isPublishing] = useActionState(publishPostAction, initial);
  const [archiveState, archiveAction, isArchiving] = useActionState(archivePostAction, initial);
  const [deleteState, deleteAction, isDeleting] = useActionState(deletePostAction, initial);
  const [uploadState, uploadAction, isUploading] = useActionState(uploadPostCoverAction, initial);
  const [removeCoverState, removeCoverAction, isRemovingCover] = useActionState(
    removePostCoverAction,
    initial,
  );

  useEffect(() => {
    if (
      saveState.ok ||
      publishState.ok ||
      archiveState.ok ||
      uploadState.ok ||
      removeCoverState.ok
    ) {
      router.refresh();
    }
  }, [
    archiveState.ok,
    publishState.ok,
    removeCoverState.ok,
    router,
    saveState.ok,
    uploadState.ok,
  ]);

  const statusColor: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-700",
    PUBLISHED: "bg-emerald-100 text-emerald-800",
    ARCHIVED: "bg-amber-100 text-amber-800",
  };
  const statusLabel: Record<string, string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    ARCHIVED: "Archivado",
  };

  return (
    <div className="admin-themed grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Columna principal */}
      <div className="space-y-6 xl:col-span-2">
        {/* Metadatos */}
        <AdminCard className="p-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Información del artículo</h2>
          <form action={saveAction} className="space-y-4">
            <input type="hidden" name="id" value={post.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <AdminLabel>
                  Título <span className="text-red-500">*</span>
                </AdminLabel>
                <AdminInput
                  type="text"
                  name="title"
                  required
                  defaultValue={post.title}
                />
              </div>
              <div>
                <AdminLabel>Slug</AdminLabel>
                <AdminInput
                  type="text"
                  name="slug"
                  defaultValue={post.slug}
                />
              </div>
            </div>

            <div>
              <AdminLabel>
                Categoría <span className="text-red-500">*</span>
              </AdminLabel>
              <AdminSelect
                name="categoryId"
                required
                defaultValue={post.categoryId}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c._count.posts})
                  </option>
                ))}
              </AdminSelect>
            </div>

            <div>
              <AdminLabel>Extracto</AdminLabel>
              <AdminTextarea
                name="excerpt"
                rows={2}
                maxLength={400}
                defaultValue={post.excerpt ?? ""}
                placeholder="Breve descripción visible en listados"
              />
            </div>

            <div>
              <AdminLabel className="mb-2">Contenido</AdminLabel>
              <RichTextEditor
                name="body"
                defaultHtml={post.bodyHtml ?? ""}
                defaultText={post.bodyText ?? ""}
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
              <AdminButton type="submit" disabled={isSaving} className="rounded-lg px-5 py-2">
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      </div>

      {/* Columna lateral */}
      <div className="space-y-4">
        {/* Estado del artículo */}
        <AdminCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Estado</h2>
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[post.status]}`}
            >
              {statusLabel[post.status]}
            </span>
            {post.publishedAt && (
              <span className="text-xs text-zinc-400">
                {post.publishedAt.toLocaleDateString("es-PR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <form action={publishAction}>
              <input type="hidden" name="id" value={post.id} />
              <AdminButton
                type="submit"
                variant="secondary"
                disabled={isPublishing || post.status === "ARCHIVED"}
                className="w-full rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPublishing
                  ? "…"
                  : post.status === "PUBLISHED"
                    ? "Despublicar"
                    : "Publicar"}
              </AdminButton>
            </form>

            {post.status !== "ARCHIVED" && (
              <form action={archiveAction}>
                <input type="hidden" name="id" value={post.id} />
                <AdminButton
                  type="submit"
                  variant="secondary"
                  disabled={isArchiving}
                  className="w-full rounded-lg border-amber-200 px-3 py-2 text-amber-700 hover:bg-amber-50"
                >
                  {isArchiving ? "…" : "Archivar"}
                </AdminButton>
              </form>
            )}

            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (!confirm("¿Eliminar este artículo? Esta acción no se puede deshacer.")) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={post.id} />
              <AdminButton
                type="submit"
                variant="danger"
                disabled={isDeleting}
                className="w-full rounded-lg px-3 py-2"
              >
                {isDeleting ? "…" : "Eliminar artículo"}
              </AdminButton>
            </form>
          </div>

          {(publishState.message || archiveState.message || deleteState.message) && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {publishState.message || archiveState.message || deleteState.message}
            </p>
          )}
        </AdminCard>

        {/* Imagen de portada */}
        <AdminCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Imagen de portada</h2>

          {post.coverImageUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200">
                <Image
                  src={post.coverImageUrl}
                  alt="Portada del artículo"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <form action={removeCoverAction}>
                <input type="hidden" name="id" value={post.id} />
                <AdminButton
                  type="submit"
                  variant="danger"
                  disabled={isRemovingCover}
                  className="w-full rounded-lg px-3 py-2 text-xs"
                >
                  {isRemovingCover ? "…" : "Eliminar imagen"}
                </AdminButton>
              </form>
              {removeCoverState.message && !removeCoverState.ok && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {removeCoverState.message}
                </p>
              )}
            </div>
          ) : (
            <form action={uploadAction} className="space-y-3">
              <input type="hidden" name="id" value={post.id} />
              <input
                ref={fileInputRef}
                type="file"
                name="cover"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              <div className="flex items-center gap-2">
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg px-3 py-2 text-xs"
                >
                  Buscar archivo
                </AdminButton>
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
              <AdminButton
                type="submit"
                disabled={isUploading || !fileName}
                className="w-full rounded-lg px-3 py-2 text-xs disabled:opacity-50"
              >
                {isUploading ? "Subiendo…" : "Subir imagen"}
              </AdminButton>
            </form>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
