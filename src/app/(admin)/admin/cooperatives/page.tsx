import { CooperativeStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { ConfirmDeleteCooperativeButton } from "@/app/(admin)/admin/cooperatives/ConfirmDeleteCooperativeButton";
import { CooperativesSearchInput } from "@/app/(admin)/admin/cooperatives/CooperativesSearchInput";
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

const PAGE_SIZE = 20;

type CooperativesPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

function getPaginationNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 1) return [1];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pages = new Set<number>([1, totalPages]);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function buildCooperativeFilter(searchQuery: string): Prisma.CooperativeWhereInput | undefined {
  if (!searchQuery) return undefined;

  return {
    OR: [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { slug: { contains: searchQuery, mode: "insensitive" } },
      { municipalityCode: { contains: searchQuery, mode: "insensitive" } },
      { municipality: { name: { contains: searchQuery, mode: "insensitive" } } },
    ],
  };
}

export default async function CooperativesPage({ searchParams }: CooperativesPageProps) {
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

  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const filter = buildCooperativeFilter(searchQuery);

  const [totalCount, publishedCount, pendingCount, filteredCount, municipalities] = await Promise.all([
    db.cooperative.count(),
    db.cooperative.count({ where: { status: CooperativeStatus.PUBLISHED } }),
    db.cooperative.count({ where: { reviewStatus: "PENDING" } }),
    db.cooperative.count({ where: filter }),
    db.municipality.findMany({
      orderBy: { name: "asc" },
      select: {
        code: true,
        name: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1;
  const paginationNumbers = getPaginationNumbers(currentPage, totalPages);

  const cooperatives = await db.cooperative.findMany({
    where: filter,
    orderBy: [{ createdAt: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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
  });

  const pageStart = filteredCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredCount);

  const pageHref = (page: number) => {
    const query = new URLSearchParams();
    if (searchQuery) query.set("q", searchQuery);
    if (page > 1) query.set("page", String(page));
    const queryText = query.toString();
    return queryText ? `/admin/cooperatives?${queryText}` : "/admin/cooperatives";
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <h2 className="text-2xl font-semibold" style={{ color: "#0f2c24" }}>Gestión de cooperativas</h2>
        <p className="text-sm" style={{ color: "#4e6d62" }}>
          {totalCount} en total
          {" · "}
          {publishedCount} publicadas
          {" · "}
          {pendingCount} pendientes de revisión
        </p>
      </header>

      <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
        <CooperativesSearchInput key={searchQuery} initialQuery={searchQuery} />

        <p className="mt-3 text-xs" style={{ color: "#68867b" }}>
          Mostrando {pageStart}-{pageEnd} de {filteredCount} resultado{filteredCount === 1 ? "" : "s"}
          {searchQuery ? ` para "${searchQuery}"` : ""}.
        </p>
      </div>

      {filteredCount === 0 ? (
        <div className="rounded-xl border bg-white px-5 py-8 text-sm" style={{ borderColor: "#d7e4dd", color: "#5f7d72" }}>
          No encontramos cooperativas con ese criterio de búsqueda.
        </div>
      ) : null}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {cooperatives.map((cooperative) => (
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: "#d7e4dd" }} key={cooperative.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium" style={{ color: "#102e26" }}>{cooperative.name}</p>
                <p className="text-xs" style={{ color: "#68867b" }}>/{cooperative.slug}</p>
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
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-sm" style={{ color: "#5b7a6f" }}>
              <span>{cooperative.municipality?.name ?? cooperative.municipalityCode}</span>
              <span>·</span>
              <span>{reviewLabel[cooperative.reviewStatus] ?? cooperative.reviewStatus}</span>
            </div>
            <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "#edf2ef" }}>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  className="rounded-md border px-3 py-1.5 text-center text-xs font-medium"
                  style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
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
                    className="w-full rounded-md border px-3 py-1.5 text-xs font-medium"
                    style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                    type="submit"
                  >
                    {cooperative.status === CooperativeStatus.PUBLISHED ? "Despublicar" : "Publicar"}
                  </button>
                </form>
              </div>

              <ConfirmDeleteCooperativeButton
                cooperativeId={cooperative.id}
                cooperativeName={cooperative.name}
                triggerClassName="w-full"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white md:block" style={{ borderColor: "#d7e4dd" }}>
        <table className="w-full border-collapse text-left text-sm">
          <thead style={{ backgroundColor: "#f3f8f5", color: "#54736a" }}>
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
              <tr className="border-t" style={{ borderColor: "#edf2ef" }} key={cooperative.id}>
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: "#102e26" }}>{cooperative.name}</p>
                  <p className="text-xs" style={{ color: "#68867b" }}>/{cooperative.slug}</p>
                </td>
                <td className="px-4 py-3">{cooperative.municipality?.name ?? cooperative.municipalityCode}</td>
                <td className="px-4 py-3">{statusLabel[cooperative.status] ?? cooperative.status}</td>
                <td className="px-4 py-3">
                  {reviewLabel[cooperative.reviewStatus] ?? cooperative.reviewStatus}
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-55 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        className="rounded-md border px-3 py-1.5 text-center text-xs font-medium"
                        style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
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
                          className="w-full rounded-md border px-3 py-1.5 text-xs font-medium"
                          style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                          type="submit"
                        >
                          {cooperative.status === CooperativeStatus.PUBLISHED
                            ? "Despublicar"
                            : "Publicar"}
                        </button>
                      </form>
                    </div>
                    <ConfirmDeleteCooperativeButton
                      cooperativeId={cooperative.id}
                      cooperativeName={cooperative.name}
                      triggerClassName="w-full"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCount > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs" style={{ color: "#68867b" }}>
            Página {currentPage} de {totalPages}
          </p>

          <nav className="flex items-center gap-1" aria-label="Paginación cooperativas admin">
            <Link
              aria-disabled={currentPage <= 1}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
              href={pageHref(Math.max(1, currentPage - 1))}
              style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
            >
              Anterior
            </Link>

            {paginationNumbers.map((page) => (
              <Link
                className="rounded-md border px-2.5 py-1.5 text-xs font-medium"
                href={pageHref(page)}
                key={page}
                style={
                  page === currentPage
                    ? { borderColor: "var(--verde-impulso)", backgroundColor: "var(--verde-impulso)", color: "#fff" }
                    : { borderColor: "#c8dad1", color: "#2f5f51" }
                }
              >
                {page}
              </Link>
            ))}

            <Link
              aria-disabled={currentPage >= totalPages}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
              href={pageHref(Math.min(totalPages, currentPage + 1))}
              style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
            >
              Siguiente
            </Link>
          </nav>
        </div>
      ) : null}

      <CooperativeCreateForm municipalities={municipalities} />
    </section>
  );
}