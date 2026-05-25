import { revalidatePath } from "next/cache";

import { unassignCoopAdminAction } from "@/app/(admin)/admin/users/actions";
import { ConfirmDeleteUserButton } from "@/app/(admin)/admin/users/ConfirmDeleteUserButton";
import { UserForms } from "@/app/(admin)/admin/users/UserForms";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

function roleLabel(role: string): string {
  if (role === "PLATFORM_ADMIN") {
    return "Administrador";
  }

  if (role === "COOP_ADMIN") {
    return "Editor";
  }

  return role;
}

export default async function AdminUsersPage() {
  const actor = await requirePlatformAdmin();

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
                <td className="px-4 py-3">{roleLabel(user.role)}</td>
                <td className="px-4 py-3">{user.cooperative ? user.cooperative.name : "Sin asignar"}</td>
                <td className="px-4 py-3">{user.isActive ? "Activo" : "Inactivo"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
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
                    ) : null}

                    {user.id === actor.userId ? (
                      <span className="text-xs text-zinc-500">Usuario actual</span>
                    ) : (
                      <ConfirmDeleteUserButton
                        displayName={user.displayName}
                        email={user.email}
                        userId={user.id}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserForms cooperatives={cooperatives} />
    </section>
  );
}