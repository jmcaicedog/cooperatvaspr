import Link from "next/link";
import { notFound } from "next/navigation";

import { EditForm } from "@/app/(admin)/admin/cooperatives/[id]/EditForm";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

type CooperativeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CooperativeDetailPage({ params }: CooperativeDetailPageProps) {
  await requirePlatformAdmin();
  const { id } = await params;

  const [cooperative, municipalities] = await Promise.all([
    db.cooperative.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        municipalityCode: true,
        logoUrl: true,
        slogan: true,
        descriptionText: true,
        descriptionRich: true,
        cooperativeTypes: true,
        tags: true,
        status: true,
        reviewStatus: true,
        services: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            description: true,
            isActive: true,
          },
        },
        contacts: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            type: true,
            label: true,
            value: true,
          },
        },
        gallery: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            isPrimary: true,
          },
        },
      },
    }),
    db.municipality.findMany({
      orderBy: { name: "asc" },
      select: {
        code: true,
        name: true,
      },
    }),
  ]);

  if (!cooperative) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2 rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <p className="text-xs uppercase tracking-wide" style={{ color: "#68867b" }}>Editar cooperativa</p>
        <h2 className="text-2xl font-semibold" style={{ color: "#0f2c24" }}>{cooperative.name}</h2>
        <p className="text-sm" style={{ color: "#4e6d62" }}>
          Slug: /{cooperative.slug} | Estado: {cooperative.status} | Revisión: {cooperative.reviewStatus}
        </p>
      </header>

      <EditForm cooperative={cooperative} municipalities={municipalities} />

      <Link className="inline-flex text-sm underline" href="/admin/cooperatives">
        Volver a listado
      </Link>
    </section>
  );
}