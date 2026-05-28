import Image from "next/image";
import Link from "next/link";
import { PostStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const metadata = {
  title: "Blog cooperativo",
  description: "Articulos, noticias y analisis sobre cooperativas en Puerto Rico.",
};

export default async function BlogPage() {
  const now = new Date();
  const posts = await db.blogPost.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-7 rounded-2xl p-6 sm:p-7" style={{ background: "linear-gradient(135deg, #003024 0%, #014a34 100%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--verde-cooperativo)" }}>
          Contenido editorial
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Blog</h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.82)" }}>
          Ideas, herramientas y experiencias para fortalecer el cooperativismo en Puerto Rico.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border px-5 py-10 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
          Aun no hay articulos publicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
              <div className="relative h-44 w-full" style={{ backgroundColor: "#e6ecef" }}>
                {post.coverImageUrl ? (
                  <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--azul-compromiso)" }}>
                    Articulo
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {post.category.name}
                  {post.publishedAt ? ` · ${post.publishedAt.toLocaleDateString("es-PR")}` : ""}
                </p>
                <h2 className="text-lg font-semibold leading-tight" style={{ color: "var(--verde-impulso)" }}>
                  {post.title}
                </h2>
                <p className="line-clamp-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {post.excerpt || "Lee este contenido completo en el portal."}
                </p>
                <Link href={`/blog/${post.slug}`} className="inline-flex pt-1 text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
                  Leer articulo →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
