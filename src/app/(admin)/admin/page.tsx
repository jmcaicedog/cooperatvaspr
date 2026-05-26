import Link from "next/link";

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
        <h2 className="text-2xl font-semibold">Panel de control</h2>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Link href="/admin/cooperatives" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Cooperativas totales</p>
          <p className="text-3xl font-semibold">{total}</p>
        </Link>

        <Link href="/admin/cooperatives" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Publicadas</p>
          <p className="text-3xl font-semibold">{published}</p>
        </Link>

        <Link href="/admin/reviews" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Pendientes de revisión</p>
          <p className="text-3xl font-semibold">{pendingReview}</p>
        </Link>

        <Link href="/admin/banners" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Banners configurados</p>
          <p className="text-3xl font-semibold">{banners}</p>
        </Link>

        <Link href="/admin/blog" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Artículos publicados</p>
          <p className="text-3xl font-semibold">{publishedPosts}</p>
        </Link>

        <Link href="/admin/eventos" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Eventos próximos</p>
          <p className="text-3xl font-semibold">{upcomingEvents}</p>
        </Link>

        <Link href="/admin/testimonios" className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50">
          <p className="text-sm text-zinc-600">Testimonios activos</p>
          <p className="text-3xl font-semibold">{activeTestimonials}</p>
        </Link>
      </div>
    </section>
  );
}
