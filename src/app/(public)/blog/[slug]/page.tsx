import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostStatus } from "@prisma/client";
import { db } from "@/lib/db";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, status: true },
  });

  if (!post || post.status !== PostStatus.PUBLISHED) {
    return { title: "Articulo no encontrado" };
  }

  return {
    title: post.title,
    description: post.excerpt || "Articulo del blog cooperativo",
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      excerpt: true,
      bodyHtml: true,
      bodyText: true,
      coverImageUrl: true,
      publishedAt: true,
      status: true,
      category: { select: { name: true } },
      author: { select: { displayName: true } },
    },
  });

  if (!post || post.status !== PostStatus.PUBLISHED) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <Link href="/blog" className="mb-5 inline-flex text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
        ← Volver al blog
      </Link>

      <header className="mb-6 space-y-3">
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {post.category.name}
          {post.publishedAt ? ` · ${post.publishedAt.toLocaleDateString("es-PR")}` : ""}
          {post.author?.displayName ? ` · ${post.author.displayName}` : ""}
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "var(--verde-impulso)" }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-base sm:text-lg" style={{ color: "var(--text-secondary)" }}>
            {post.excerpt}
          </p>
        )}
      </header>

      {post.coverImageUrl && (
        <div className="relative mb-6 h-56 w-full overflow-hidden rounded-2xl sm:h-80" style={{ backgroundColor: "#e6ecef" }}>
          <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
        </div>
      )}

      {post.bodyHtml ? (
        <section className="prose-coop" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      ) : (
        <section className="space-y-4 text-sm leading-7 sm:text-base" style={{ color: "var(--text-secondary)" }}>
          {(post.bodyText || "Contenido no disponible.")
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line, index) => (
              <p key={`${post.id}-line-${index}`}>{line}</p>
            ))}
        </section>
      )}
    </article>
  );
}
