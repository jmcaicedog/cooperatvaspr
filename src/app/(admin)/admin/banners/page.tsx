import { BannerSlotCard } from "@/app/(admin)/admin/banners/BannerSlotCard";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { BANNER_SLOT_CONFIG, BANNER_SLOTS } from "@/lib/banner-config";

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
      imageUrl: true,
      isActive: true,
      targetUrl: true,
      activeFrom: true,
      activeUntil: true,
    },
  });

  const slots = BANNER_SLOTS;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Gestión de banners</h2>
        <p className="text-sm text-zinc-600">
          {banners.length} configurados
          {" · "}
          {banners.filter((b) => b.isActive).length} activos
          {" · "}
          {slots.length} slots disponibles
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {slots.map((slot) => {
          const config = BANNER_SLOT_CONFIG[slot];
          const slotBanners = banners.filter((banner) => banner.slot === slot);

          return (
            <BannerSlotCard
              banners={slotBanners}
              key={slot}
              maxImages={config.maxImages}
              requiredSize={`${config.width}x${config.height}px`}
              slot={slot}
              slotDescription={config.description}
              slotLabel={config.label}
            />
          );
        })}
      </div>
    </section>
  );
}