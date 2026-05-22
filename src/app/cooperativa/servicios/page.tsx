import { revalidatePath } from "next/cache";

import {
  createServiceAction,
  deleteServiceAction,
  toggleServiceAction,
} from "@/app/cooperativa/servicios/actions";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { getScopedCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

export default async function CooperativaServiciosPage() {
  const actor = await requireCoopAdminOrPlatform();
  const cooperative = await getScopedCooperative(actor);

  if (!cooperative) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        No hay cooperativa asignada para gestionar servicios.
      </section>
    );
  }

  const services = await db.cooperativeService.findMany({
    where: { cooperativeId: cooperative.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      isActive: true,
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <p className="text-sm text-zinc-600">Cooperativa: {cooperative.name}</p>
      </header>

      <form action={createServiceAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <input name="cooperativeId" type="hidden" value={cooperative.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nuevo servicio</h2>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="title"
          placeholder="Titulo del servicio"
          required
        />
        <textarea
          className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="description"
          placeholder="Descripcion"
        />
        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Agregar servicio
        </button>
      </form>

      <div className="space-y-3">
        {services.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Aun no hay servicios cargados.
          </article>
        ) : (
          services.map((service) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={service.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{service.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{service.description ?? "Sin descripcion"}</p>
                  <p className="mt-1 text-xs text-zinc-500">{service.isActive ? "Activo" : "Inactivo"}</p>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await toggleServiceAction(service.id);
                      revalidatePath("/cooperativa/servicios");
                    }}
                  >
                    <button className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs" type="submit">
                      {service.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await deleteServiceAction(service.id);
                      revalidatePath("/cooperativa/servicios");
                    }}
                  >
                    <button
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
                      type="submit"
                    >
                      Eliminar
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