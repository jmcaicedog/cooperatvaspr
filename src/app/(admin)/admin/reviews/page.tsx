import { ChangeRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { reviewChangeRequestAction } from "@/app/cooperativa/perfil/actions";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function ReviewsPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">
          Solo un usuario PLATFORM_ADMIN puede revisar solicitudes.
        </p>
        <a className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-2 text-sm text-white" href="/login">
          Ir a login
        </a>
      </section>
    );
  }

  const pending = await db.cooperativeChangeRequest.findMany({
    where: { status: ChangeRequestStatus.PENDING },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      severity: true,
      createdAt: true,
      notes: true,
      cooperative: {
        select: { name: true, slug: true },
      },
      requestedBy: {
        select: { email: true, displayName: true },
      },
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Revisión de cambios mayores</h2>
        <p className="text-sm text-zinc-600">
          Cola editorial para aprobar o rechazar solicitudes de cooperativas.
        </p>
      </header>

      <div className="space-y-3">
        {pending.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No hay solicitudes pendientes.
          </article>
        ) : (
          pending.map((item) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.cooperative.name}</p>
                  <p className="text-xs text-zinc-500">/{item.cooperative.slug}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Solicitado por {item.requestedBy.displayName} ({item.requestedBy.email})
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">Severidad: {item.severity}</p>
                </div>

                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await reviewChangeRequestAction(item.id, "approve");
                      revalidatePath("/admin/reviews");
                    }}
                  >
                    <button
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                      type="submit"
                    >
                      Aprobar
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await reviewChangeRequestAction(item.id, "reject");
                      revalidatePath("/admin/reviews");
                    }}
                  >
                    <button
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
                      type="submit"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
