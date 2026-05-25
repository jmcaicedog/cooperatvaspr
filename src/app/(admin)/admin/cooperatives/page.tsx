import { CooperativeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { CooperativeCreateForm } from "@/app/(admin)/admin/cooperatives/CooperativeCreateForm";
import { togglePublishCooperativeAction } from "@/app/(admin)/admin/cooperatives/actions";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

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
          Desde aquí el administrador de plataforma crea, publica y despublica cooperativas.
        </p>
      </header>

      <CooperativeCreateForm municipalities={municipalities} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
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
                <td className="px-4 py-3">{cooperative.municipalityCode}</td>
                <td className="px-4 py-3">{cooperative.status}</td>
                <td className="px-4 py-3">{cooperative.reviewStatus}</td>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}