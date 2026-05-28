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
      <header className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <h2 className="text-2xl font-semibold" style={{ color: "#0f2c24" }}>Usuarios y asignaciones</h2>
        <p className="text-sm" style={{ color: "#4e6d62" }}>
          {users.length} usuarios
          {" · "}
          {users.filter((u) => u.role === "PLATFORM_ADMIN").length} administradores
          {" · "}
          {users.filter((u) => u.role === "COOP_ADMIN").length} editores de cooperativa
        </p>
      </header>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: "#d7e4dd" }} key={user.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium" style={{ color: "#102e26" }}>{user.displayName}</p>
                <p className="text-xs" style={{ color: "#68867b" }}>{user.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {user.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-sm" style={{ color: "#5b7a6f" }}>
              <span>{roleLabel(user.role)}</span>
              {user.cooperative && (
                <>
                  <span>·</span>
                  <span>{user.cooperative.name}</span>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "#edf2ef" }}>
              {user.cooperative ? (
                <form
                  action={async () => {
                    "use server";
                    await unassignCoopAdminAction(user.id);
                    revalidatePath("/admin/users");
                  }}
                >
                  <button className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: "#c8dad1", color: "#2f5f51" }} type="submit">
                    Quitar asignación
                  </button>
                </form>
              ) : null}
              {user.id === actor.userId ? (
                <span className="text-xs" style={{ color: "#68867b" }}>Usuario actual</span>
              ) : (
                <ConfirmDeleteUserButton
                  displayName={user.displayName}
                  email={user.email}
                  userId={user.id}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white md:block" style={{ borderColor: "#d7e4dd" }}>
        <table className="w-full border-collapse text-left text-sm">
          <thead style={{ backgroundColor: "#f3f8f5", color: "#54736a" }}>
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
              <tr className="border-t" style={{ borderColor: "#edf2ef" }} key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: "#102e26" }}>{user.displayName}</p>
                  <p className="text-xs" style={{ color: "#68867b" }}>{user.email}</p>
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
                        <button className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: "#c8dad1", color: "#2f5f51" }} type="submit">
                          Quitar asignación
                        </button>
                      </form>
                    ) : null}

                    {user.id === actor.userId ? (
                      <span className="text-xs" style={{ color: "#68867b" }}>Usuario actual</span>
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