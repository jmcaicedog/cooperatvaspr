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
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Editar cooperativa</p>
        <h2 className="text-2xl font-semibold">{cooperative.name}</h2>
        <p className="text-sm text-zinc-600">
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