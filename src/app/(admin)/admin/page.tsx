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
      <header className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5f7d72" }}>
          Vista general
        </p>
        <h2 className="mt-2 text-2xl font-semibold" style={{ color: "#0f2c24" }}>Panel de control</h2>
        <p className="mt-1 text-sm" style={{ color: "#4e6d62" }}>
          Gestiona cooperativas, contenido y flujo editorial desde un solo lugar.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/cooperatives" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Cooperativas totales</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{total}</p>
        </Link>

        <Link href="/admin/cooperatives" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Publicadas</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{published}</p>
        </Link>

        <Link href="/admin/reviews" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Pendientes de revisión</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{pendingReview}</p>
        </Link>

        <Link href="/admin/banners" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Banners configurados</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{banners}</p>
        </Link>

        <Link href="/admin/blog" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Artículos publicados</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{publishedPosts}</p>
        </Link>

        <Link href="/admin/eventos" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Eventos próximos</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{upcomingEvents}</p>
        </Link>

        <Link href="/admin/testimonios" className="rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-sm" style={{ color: "#5f7d72" }}>Testimonios activos</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "#0e2f25" }}>{activeTestimonials}</p>
        </Link>
      </div>
    </section>
  );
}
