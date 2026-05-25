import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { TestimonialManager } from "./TestimonialManager";

export default async function TestimoniosPage() {
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

  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      authorName: true,
      authorRole: true,
      authorOrganization: true,
      avatarUrl: true,
      body: true,
      isPublished: true,
      sortOrder: true,
    },
  });

  const published = testimonials.filter((t) => t.isPublished);
  const drafts = testimonials.filter((t) => !t.isPublished);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Testimonios</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {published.length} activo(s) · {drafts.length} inactivo(s)
        </p>
      </div>
      <TestimonialManager testimonials={testimonials} />
    </div>
  );
}
