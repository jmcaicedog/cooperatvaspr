import { CooperativeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { ConfirmDeleteCooperativeButton } from "@/app/(admin)/admin/cooperatives/ConfirmDeleteCooperativeButton";
import { CooperativeCreateForm } from "@/app/(admin)/admin/cooperatives/CooperativeCreateForm";
import { togglePublishCooperativeAction } from "@/app/(admin)/admin/cooperatives/actions";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const statusLabel: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  UNPUBLISHED: "Despublicado",
};

const reviewLabel: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export default async function CooperativesPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">
          Esta vista requiere iniciar sesión con un usuario PLATFORM_ADMIN.
        </p>
        <a className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-2 text-sm text-white" href="/login">
          Ir a login
        </a>
      </section>
    );
  }

  const [cooperatives, municipalities] = await Promise.all([
    db.cooperative.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        municipalityCode: true,
        municipality: {
          select: {
            name: true,
          },
        },
        status: true,
        reviewStatus: true,
        updatedAt: true,
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

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Gestión de cooperativas</h2>
        <p className="text-sm text-zinc-600">
          {cooperatives.length} en total
          {" · "}
          {cooperatives.filter((c) => c.status === "PUBLISHED").length} publicadas
          {" · "}
          {cooperatives.filter((c) => c.reviewStatus === "PENDING").length} pendientes de revisión
        </p>
      </header>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {cooperatives.map((cooperative) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-4" key={cooperative.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-900">{cooperative.name}</p>
                <p className="text-xs text-zinc-500">/{cooperative.slug}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  cooperative.status === CooperativeStatus.PUBLISHED
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {statusLabel[cooperative.status] ?? cooperative.status}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-sm text-zinc-500">
              <span>{cooperative.municipality?.name ?? cooperative.municipalityCode}</span>
              <span>·</span>
              <span>{reviewLabel[cooperative.reviewStatus] ?? cooperative.reviewStatus}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
              <Link
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                href={`/admin/cooperatives/${cooperative.id}`}
              >
                Editar
              </Link>
              <form
                action={async () => {
                  "use server";
                  await togglePublishCooperativeAction(cooperative.id);
                  revalidatePath("/admin/cooperatives");
                }}
              >
                <button
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                  type="submit"
                >
                  {cooperative.status === CooperativeStatus.PUBLISHED ? "Despublicar" : "Publicar"}
                </button>
              </form>
              <ConfirmDeleteCooperativeButton
                cooperativeId={cooperative.id}
                cooperativeName={cooperative.name}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Municipio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Revisión</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {cooperatives.map((cooperative) => (
              <tr className="border-t border-zinc-200" key={cooperative.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{cooperative.name}</p>
                  <p className="text-xs text-zinc-500">/{cooperative.slug}</p>
                </td>
                <td className="px-4 py-3">{cooperative.municipality?.name ?? cooperative.municipalityCode}</td>
                <td className="px-4 py-3">{statusLabel[cooperative.status] ?? cooperative.status}</td>
                <td className="px-4 py-3">
                  {reviewLabel[cooperative.reviewStatus] ?? cooperative.reviewStatus}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                      href={`/admin/cooperatives/${cooperative.id}`}
                    >
                      Editar
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await togglePublishCooperativeAction(cooperative.id);
                        revalidatePath("/admin/cooperatives");
                      }}
                    >
                      <button
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                        type="submit"
                      >
                        {cooperative.status === CooperativeStatus.PUBLISHED
                          ? "Despublicar"
                          : "Publicar"}
                      </button>
                    </form>
                    <ConfirmDeleteCooperativeButton
                      cooperativeId={cooperative.id}
                      cooperativeName={cooperative.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CooperativeCreateForm municipalities={municipalities} />
    </section>
  );
}