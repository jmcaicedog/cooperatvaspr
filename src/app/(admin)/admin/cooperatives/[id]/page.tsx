import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

import { EditForm } from "@/app/(admin)/admin/cooperatives/[id]/EditForm";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { isMissingCooperativeBranchStorage } from "@/lib/cooperative-branches";
import { db } from "@/lib/db";

type CooperativeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CooperativeDetailPage({ params }: CooperativeDetailPageProps) {
  await requirePlatformAdmin();
  const { id } = await params;

  const cooperativeBaseSelect = Prisma.validator<Prisma.CooperativeSelect>()({
    id: true,
    name: true,
    slug: true,
    municipalityCode: true,
    foundedYear: true,
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
      where: { type: { not: "ADDRESS" } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        type: true,
        label: true,
        value: true,
      },
    },
    socialLinks: {
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        platform: true,
        url: true,
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
  });

  const [cooperative, municipalities] = await Promise.all([
    (async () => {
      try {
        return await db.cooperative.findUnique({
          where: { id },
          select: {
            ...cooperativeBaseSelect,
            branches: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true,
                label: true,
                address: true,
                municipalityCode: true,
                municipality: { select: { name: true } },
              },
            },
          },
        });
      } catch (error) {
        if (!isMissingCooperativeBranchStorage(error)) {
          throw error;
        }

        const fallback = await db.cooperative.findUnique({
          where: { id },
          select: cooperativeBaseSelect,
        });

        return fallback ? { ...fallback, branches: [] } : null;
      }
    })(),
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