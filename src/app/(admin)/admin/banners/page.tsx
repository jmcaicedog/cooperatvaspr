import { BannerSlot } from "@prisma/client";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function BannersPage() {
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

  const banners = await db.homeBanner.findMany({
    orderBy: [{ slot: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      slot: true,
      title: true,
      isActive: true,
      targetUrl: true,
      activeFrom: true,
      activeUntil: true,
    },
  });

  const slots = [BannerSlot.HERO, BannerSlot.SIDEBAR_TOP, BannerSlot.SIDEBAR_BOTTOM];

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Gestión de banners</h2>
        <p className="text-sm text-zinc-600">
          Slots iniciales del home: HERO rotativo y dos banners verticales.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {slots.map((slot) => {
          const slotBanners = banners.filter((banner) => banner.slot === slot);

          return (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={slot}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">{slot}</h3>

              {slotBanners.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">Sin banners configurados aún.</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm">
                  {slotBanners.map((banner) => (
                    <li className="rounded-md border border-zinc-200 p-3" key={banner.id}>
                      <p className="font-medium">{banner.title}</p>
                      <p className="text-xs text-zinc-500">{banner.targetUrl ?? "Sin enlace"}</p>
                      <p className="mt-1 text-xs">{banner.isActive ? "Activo" : "Inactivo"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}