import { notFound } from "next/navigation";
import Link from "next/link";

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
    db.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-5 sm:p-6"
        style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0f2c24" }}>Editar artículo</h1>
            <p className="mt-1 text-sm" style={{ color: "#4e6d62" }}>
              Actualizado el{" "}
              {post.updatedAt.toLocaleDateString("es-PR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {post.author ? ` · ${post.author.displayName}` : ""}
            </p>
          </div>

          <Link
            href="/admin/blog/categories"
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium"
            style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
          >
            Gestionar categorías
          </Link>
        </div>
      </div>
      <EditPostForm post={post} categories={categories} />
    </div>
  );
}
