import { notFound } from "next/navigation";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;

  const [post, categories] = await Promise.all([
    db.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        bodyHtml: true,
        bodyText: true,
        coverImageUrl: true,
        status: true,
        categoryId: true,
        publishedAt: true,
        updatedAt: true,
        author: { select: { displayName: true } },
      },
    }),
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Editar artículo</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Actualizado el{" "}
          {post.updatedAt.toLocaleDateString("es-PR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {post.author ? ` · ${post.author.displayName}` : ""}
        </p>
      </div>
      <EditPostForm post={post} categories={categories} />
    </div>
  );
}
