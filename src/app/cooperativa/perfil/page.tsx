import { UserRole } from "@prisma/client";

import { ProfileForm } from "@/app/cooperativa/perfil/ProfileForm";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function CooperativeProfilePage() {
  const actor = await (async () => {
    try {
      return await requireCoopAdminOrPlatform();
    } catch {
      return null;
    }
  })();

  if (!actor) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">Debes iniciar sesión para gestionar el perfil de cooperativa.</p>
        <a className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-2 text-sm text-white" href="/login">
          Ir a login
        </a>
      </section>
    );
  }

  const [cooperative, municipalities] = await Promise.all([
    db.cooperative.findFirst({
      where:
        actor.role === UserRole.PLATFORM_ADMIN
          ? undefined
          : {
              id: actor.cooperativeId ?? undefined,
            },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        municipalityCode: true,
        foundedYear: true,
        logoUrl: true,
        slogan: true,
        descriptionText: true,
        descriptionRich: true,
        cooperativeTypes: true,
        tags: true,
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

  if (!cooperative) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        No hay cooperativa asignada para este usuario.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Perfil de cooperativa</h1>
      <p className="text-sm text-zinc-600">
        Comienza actualizando el logo. Luego puedes editar los datos del perfil, que pasan a revision cuando
        son cambios mayores.
      </p>
      <ProfileForm cooperative={cooperative} municipalities={municipalities} />
    </section>
  );
}
