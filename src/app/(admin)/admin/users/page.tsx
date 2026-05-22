import { revalidatePath } from "next/cache";

import { unassignCoopAdminAction } from "@/app/(admin)/admin/users/actions";
import { UserForms } from "@/app/(admin)/admin/users/UserForms";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  await requirePlatformAdmin();

  const [cooperatives, users] = await Promise.all([
    db.cooperative.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.user.findMany({
      orderBy: [{ role: "asc" }, { email: "asc" }],
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        isActive: true,
        cooperative: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Usuarios y asignaciones</h2>
        <p className="text-sm text-zinc-600">
          El administrador de plataforma puede crear usuarios de cooperativa y asignarlos.
        </p>
      </header>

      <UserForms cooperatives={cooperatives} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-700">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Cooperativa asignada</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-t border-zinc-200" key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{user.displayName}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  {user.cooperative ? `${user.cooperative.name} (/${user.cooperative.slug})` : "Sin asignar"}
                </td>
                <td className="px-4 py-3">{user.isActive ? "Activo" : "Inactivo"}</td>
                <td className="px-4 py-3">
                  {user.cooperative ? (
                    <form
                      action={async () => {
                        "use server";
                        await unassignCoopAdminAction(user.id);
                        revalidatePath("/admin/users");
                      }}
                    >
                      <button className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs" type="submit">
                        Quitar asignación
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-zinc-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}