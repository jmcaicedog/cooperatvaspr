import Link from "next/link";
import { revalidatePath } from "next/cache";

import { unassignCoopAdminAction } from "@/app/(admin)/admin/users/actions";
import { updateManagedUserAction } from "@/app/(admin)/admin/users/actions";
import { ConfirmDeleteUserButton } from "@/app/(admin)/admin/users/ConfirmDeleteUserButton";
import { UserForms } from "@/app/(admin)/admin/users/UserForms";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

type AdminUsersPageProps = {
  searchParams: Promise<{
    role?: string;
    status?: string;
  }>;
};

type UserRoleFilter = "all" | "PLATFORM_ADMIN" | "COOP_ADMIN";
type UserStatusFilter = "all" | "active" | "inactive";

function roleLabel(role: string): string {
  if (role === "PLATFORM_ADMIN") {
    return "Administrador";
  }

  if (role === "COOP_ADMIN") {
    return "Editor";
  }

  return role;
}

function getRoleFilter(value: string | undefined): UserRoleFilter {
  if (value === "PLATFORM_ADMIN" || value === "COOP_ADMIN") {
    return value;
  }

  return "all";
}

function getStatusFilter(value: string | undefined): UserStatusFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function buildUsersHref(role: UserRoleFilter, status: UserStatusFilter): string {
  const query = new URLSearchParams();

  if (role !== "all") {
    query.set("role", role);
  }

  if (status !== "all") {
    query.set("status", status);
  }

  const queryText = query.toString();
  return queryText ? `/admin/users?${queryText}` : "/admin/users";
}

function filterChipClassName(active: boolean): string {
  return active
    ? "border-emerald-700 bg-emerald-700 text-white"
    : "border-[#c8dad1] bg-white text-[#2f5f51] hover:border-[#9eb8ad] hover:bg-[#f5faf7]";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const actor = await requirePlatformAdmin();
  const params = await searchParams;
  const roleFilter = getRoleFilter(params.role);
  const statusFilter = getStatusFilter(params.status);

  const where = {
    ...(roleFilter !== "all" ? { role: roleFilter } : {}),
    ...(statusFilter === "active" ? { isActive: true } : {}),
    ...(statusFilter === "inactive" ? { isActive: false } : {}),
  };

  const [cooperatives, users, totalUsers, platformAdminsCount, coopEditorsCount, inactiveUsersCount] = await Promise.all([
    db.cooperative.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { email: "asc" }],
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        isActive: true,
        cooperativeId: true,
        cooperative: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    db.user.count(),
    db.user.count({ where: { role: "PLATFORM_ADMIN" } }),
    db.user.count({ where: { role: "COOP_ADMIN" } }),
    db.user.count({ where: { isActive: false } }),
  ]);

  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all";

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <h2 className="text-2xl font-semibold" style={{ color: "#0f2c24" }}>Usuarios y asignaciones</h2>
        <p className="text-sm" style={{ color: "#4e6d62" }}>
          {totalUsers} usuarios
          {" · "}
          {platformAdminsCount} administradores
          {" · "}
          {coopEditorsCount} editores de cooperativa
          {" · "}
          {inactiveUsersCount} inactivos
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-4">
        <Link className="rounded-2xl border p-4 transition-colors hover:bg-[#f7fbf9]" href={buildUsersHref("PLATFORM_ADMIN", "all")} style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#68867b" }}>Administradores</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "#102e26" }}>{platformAdminsCount}</p>
          <p className="mt-1 text-sm" style={{ color: "#5b7a6f" }}>Ver solo administradores de plataforma</p>
        </Link>
        <Link className="rounded-2xl border p-4 transition-colors hover:bg-[#f7fbf9]" href={buildUsersHref("COOP_ADMIN", "all")} style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#68867b" }}>Editores</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "#102e26" }}>{coopEditorsCount}</p>
          <p className="mt-1 text-sm" style={{ color: "#5b7a6f" }}>Ver editores de cooperativa</p>
        </Link>
        <Link className="rounded-2xl border p-4 transition-colors hover:bg-[#f7fbf9]" href={buildUsersHref("all", "inactive")} style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#68867b" }}>Inactivos</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "#102e26" }}>{inactiveUsersCount}</p>
          <p className="mt-1 text-sm" style={{ color: "#5b7a6f" }}>Ver usuarios desactivados</p>
        </Link>
        <Link className="rounded-2xl border p-4 transition-colors hover:bg-[#f7fbf9]" href="/admin/users" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#68867b" }}>Todos</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "#102e26" }}>{totalUsers}</p>
          <p className="mt-1 text-sm" style={{ color: "#5b7a6f" }}>Limpiar filtros y ver el padrón completo</p>
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "#d7e4dd" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#68867b" }}>Filtrar por rol</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterChipClassName(roleFilter === "all")}`} href={buildUsersHref("all", statusFilter)}>
                  Todos
                </Link>
                <Link className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterChipClassName(roleFilter === "PLATFORM_ADMIN")}`} href={buildUsersHref("PLATFORM_ADMIN", statusFilter)}>
                  Administradores
                </Link>
                <Link className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterChipClassName(roleFilter === "COOP_ADMIN")}`} href={buildUsersHref("COOP_ADMIN", statusFilter)}>
                  Editores
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#68867b" }}>Filtrar por estado</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterChipClassName(statusFilter === "all")}`} href={buildUsersHref(roleFilter, "all")}>
                  Todos
                </Link>
                <Link className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterChipClassName(statusFilter === "active")}`} href={buildUsersHref(roleFilter, "active")}>
                  Activos
                </Link>
                <Link className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filterChipClassName(statusFilter === "inactive")}`} href={buildUsersHref(roleFilter, "inactive")}>
                  Inactivos
                </Link>
              </div>
            </div>
          </div>

          <div className="text-sm" style={{ color: "#5b7a6f" }}>
            Mostrando {users.length} usuario{users.length === 1 ? "" : "s"}
            {roleFilter !== "all" ? ` · ${roleLabel(roleFilter)}` : ""}
            {statusFilter === "active" ? " · Solo activos" : ""}
            {statusFilter === "inactive" ? " · Solo inactivos" : ""}
            {hasActiveFilters ? (
              <>
                {" · "}
                <Link className="font-medium" href="/admin/users" style={{ color: "#1f5b4b" }}>
                  Limpiar filtros
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border bg-white px-5 py-8 text-sm" style={{ borderColor: "#d7e4dd", color: "#5f7d72" }}>
          No hay usuarios que coincidan con los filtros seleccionados.
        </div>
      ) : null}

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
            <form action={updateManagedUserAction} className="mt-3 grid gap-2 border-t pt-3" style={{ borderColor: "#edf2ef" }}>
              <input type="hidden" name="userId" value={user.id} />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                defaultValue={user.displayName}
                name="displayName"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                  defaultValue={user.role}
                  name="role"
                >
                  <option value="PLATFORM_ADMIN">Administrador</option>
                  <option value="COOP_ADMIN">Editor cooperativa</option>
                </select>
                <select
                  className="rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                  defaultValue={user.isActive ? "true" : "false"}
                  name="isActive"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <select
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                defaultValue={user.cooperativeId ?? ""}
                name="cooperativeId"
              >
                <option value="">Sin cooperativa asignada</option>
                {cooperatives.map((cooperative) => (
                  <option key={cooperative.id} value={cooperative.id}>
                    {cooperative.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: "#c8dad1", color: "#2f5f51" }} type="submit">
                  Guardar cambios
                </button>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap gap-2" style={{ borderColor: "#edf2ef" }}>
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
      {users.length > 0 ? (
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
                <tr className="border-t align-top" style={{ borderColor: "#edf2ef" }} key={user.id}>
                  <td className="px-4 py-3">
                    <div>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                        defaultValue={user.displayName}
                        form={`user-update-${user.id}`}
                        name="displayName"
                        required
                      />
                      <p className="mt-1 text-xs" style={{ color: "#68867b" }}>{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                      defaultValue={user.role}
                      form={`user-update-${user.id}`}
                      name="role"
                    >
                      <option value="PLATFORM_ADMIN">Administrador</option>
                      <option value="COOP_ADMIN">Editor cooperativa</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                      defaultValue={user.cooperativeId ?? ""}
                      form={`user-update-${user.id}`}
                      name="cooperativeId"
                    >
                      <option value="">Sin asignar</option>
                      {cooperatives.map((cooperative) => (
                        <option key={cooperative.id} value={cooperative.id}>
                          {cooperative.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      style={{ borderColor: "#c8dad1", color: "#2f5f51" }}
                      defaultValue={user.isActive ? "true" : "false"}
                      form={`user-update-${user.id}`}
                      name="isActive"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={updateManagedUserAction} id={`user-update-${user.id}`}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: "#c8dad1", color: "#2f5f51" }} type="submit">
                          Guardar
                        </button>
                      </form>
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
      ) : null}

      <UserForms cooperatives={cooperatives} />
    </section>
  );
}