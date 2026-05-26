import Link from "next/link";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { CreatePostForm } from "./CreatePostForm";

const statusLabel: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

const statusColor: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-amber-100 text-amber-800",
};

export default async function BlogPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">Esta vista requiere iniciar sesión con un usuario PLATFORM_ADMIN.</p>
      </section>
    );
  }

  const [posts, categories] = await Promise.all([
    db.blogPost.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true } },
        author: { select: { displayName: true } },
      },
    }),
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Blog</h1>
          <p className="mt-1 text-sm text-zinc-500">{posts.length} artículo(s)</p>
        </div>
        <Link
          href="/admin/blog/categories"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Gestionar categorías
        </Link>
      </div>

      {/* Tabla de posts */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {posts.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Aún no hay artículos. Crea el primero abajo.
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-zinc-100 md:hidden">
              {posts.map((post) => (
                <div className="flex items-start justify-between gap-3 p-4" key={post.id}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{post.title}</p>
                    <p className="text-xs text-zinc-400">{post.slug}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[post.status]}`}
                      >
                        {statusLabel[post.status]}
                      </span>
                      <span className="text-xs text-zinc-400">{post.category.name}</span>
                      <span className="text-xs text-zinc-400">
                        {post.updatedAt.toLocaleDateString("es-PR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Título</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Categoría</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Actualizado</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-600">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        <div className="max-w-xs truncate">{post.title}</div>
                        <div className="text-xs text-zinc-400">{post.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{post.category.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[post.status]}`}
                        >
                          {statusLabel[post.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {post.updatedAt.toLocaleDateString("es-PR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Formulario crear post */}
      {categories.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Debes{" "}
          <Link href="/admin/blog/categories" className="font-semibold underline">
            crear al menos una categoría
          </Link>{" "}
          antes de publicar un artículo.
        </div>
      ) : (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Nuevo artículo</h2>
          <CreatePostForm categories={categories} />
        </section>
      )}
    </div>
  );
}
