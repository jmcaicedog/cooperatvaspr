import { CooperativeStatus } from "@prisma/client";

import { db } from "@/lib/db";

export default async function AdminPage() {
  const now = new Date();

  const [
    total,
    published,
    pendingReview,
    banners,
    publishedPosts,
    upcomingEvents,
    activeTestimonials,
  ] = await Promise.all([
    db.cooperative.count(),
    db.cooperative.count({ where: { status: CooperativeStatus.PUBLISHED } }),
    db.cooperative.count({ where: { reviewStatus: "PENDING" } }),
    db.homeBanner.count(),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.event.count({ where: { startsAt: { gte: now }, isPublished: true } }),
    db.testimonial.count({ where: { isPublished: true } }),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Resumen del módulo admin</h2>
        <p className="text-sm text-zinc-600">
          Primera iteración enfocada en backoffice y gestión editorial.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Cooperativas totales</p>
          <p className="text-3xl font-semibold">{total}</p>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Publicadas</p>
          <p className="text-3xl font-semibold">{published}</p>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Pendientes de revisión</p>
          <p className="text-3xl font-semibold">{pendingReview}</p>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Banners configurados</p>
          <p className="text-3xl font-semibold">{banners}</p>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Artículos publicados</p>
          <p className="text-3xl font-semibold">{publishedPosts}</p>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Eventos próximos</p>
          <p className="text-3xl font-semibold">{upcomingEvents}</p>
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Testimonios activos</p>
          <p className="text-3xl font-semibold">{activeTestimonials}</p>
        </article>
      </div>
    </section>
  );
}
