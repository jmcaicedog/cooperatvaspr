import { revalidatePath } from "next/cache";

import {
  createBranchAction,
  deleteBranchAction,
  updateBranchAction,
} from "@/app/cooperativa/sucursales/actions";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { getScopedCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

export default async function CooperativaSucursalesPage() {
  const actor = await requireCoopAdminOrPlatform();
  const cooperative = await getScopedCooperative(actor);

  if (!cooperative) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        No hay cooperativa asignada para gestionar sucursales.
      </section>
    );
  }

  const [branches, municipalities] = await Promise.all([
    db.cooperativeBranch.findMany({
      where: { cooperativeId: cooperative.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        label: true,
        address: true,
        municipalityCode: true,
        municipality: { select: { name: true } },
      },
    }),
    db.municipality.findMany({
      orderBy: { name: "asc" },
      select: { code: true, name: true },
    }),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sucursales</h1>
        <p className="text-sm text-zinc-600">Cooperativa: {cooperative.name}</p>
      </header>

      <div className="space-y-3">
        {branches.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Aun no hay sucursales registradas.
          </article>
        ) : (
          branches.map((branch, index) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={branch.id}>
              <div className="flex items-start gap-3">
                <div className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-xs font-semibold text-zinc-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <form action={updateBranchAction} className="grid gap-2">
                    <input name="branchId" type="hidden" value={branch.id} />
                    <input name="cooperativeId" type="hidden" value={cooperative.id} />

                    <select
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      defaultValue={branch.municipalityCode}
                      name="municipalityCode"
                      required
                    >
                      {municipalities.map((municipality) => (
                        <option key={municipality.code} value={municipality.code}>
                          {municipality.name}
                        </option>
                      ))}
                    </select>

                    <input
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      defaultValue={branch.label ?? ""}
                      maxLength={100}
                      name="label"
                      placeholder="Nombre de la sucursal (opcional)"
                    />

                    <textarea
                      className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      defaultValue={branch.address}
                      name="address"
                      placeholder="Dirección completa"
                      required
                    />

                    <button
                      className="w-fit rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                      type="submit"
                    >
                      Guardar edicion
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await deleteBranchAction(branch.id);
                      revalidatePath("/cooperativa/sucursales");
                    }}
                  >
                    <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white" type="submit">
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <form action={createBranchAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <input name="cooperativeId" type="hidden" value={cooperative.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nueva sucursal</h2>

        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" name="municipalityCode" required>
          <option value="">Selecciona un municipio</option>
          {municipalities.map((municipality) => (
            <option key={municipality.code} value={municipality.code}>
              {municipality.name}
            </option>
          ))}
        </select>

        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          maxLength={100}
          name="label"
          placeholder="Nombre de la sucursal (opcional)"
        />

        <textarea
          className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="address"
          placeholder="Dirección completa"
          required
        />

        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Agregar sucursal
        </button>
      </form>
    </section>
  );
}
