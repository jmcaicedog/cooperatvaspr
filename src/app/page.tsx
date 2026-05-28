import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroBanner, SidebarBanner, type BannerItem } from "@/components/BannerComponents";
import { CooperativeDirectory } from "@/components/CooperativeDirectory";
import { db } from "@/lib/db";
import { CooperativeStatus } from "@prisma/client";

async function getActiveBanners(slot: "HERO" | "SIDEBAR_TOP" | "SIDEBAR_BOTTOM"): Promise<BannerItem[]> {
  const now = new Date();
  return db.homeBanner.findMany({
    where: {
      slot,
      isActive: true,
      OR: [{ activeFrom: null }, { activeFrom: { lte: now } }],
      AND: [{ OR: [{ activeUntil: null }, { activeUntil: { gte: now } }] }],
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, imageUrl: true, targetUrl: true },
  });
}

export default async function Home() {
  const [heroBanners, sidebarTopBanners, sidebarBottomBanners, rawCoops, municipalities] =
    await Promise.all([
      getActiveBanners("HERO"),
      getActiveBanners("SIDEBAR_TOP"),
      getActiveBanners("SIDEBAR_BOTTOM"),
      db.cooperative.findMany({
        where: { status: CooperativeStatus.PUBLISHED },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          municipalityCode: true,
          municipality: { select: { name: true } },
          logoUrl: true,
          slogan: true,
          cooperativeTypes: true,
          tags: true,
        },
      }),
      db.municipality.findMany({
        orderBy: { name: "asc" },
        select: { code: true, name: true },
      }),
    ]);

  const cooperatives = rawCoops.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    municipalityCode: c.municipalityCode,
    municipalityName: c.municipality.name,
    logoUrl: c.logoUrl,
    slogan: c.slogan,
    cooperativeTypes: c.cooperativeTypes as string[],
    tags: c.tags,
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero banner */}
        {heroBanners.length > 0 && (
          <div className="w-full">
            <HeroBanner banners={heroBanners} />
          </div>
        )}

        {/* Intro strip (when no hero banner) */}
        {heroBanners.length === 0 && (
          <div
            className="w-full py-16 px-4 text-center"
            style={{
              background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)`,
            }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--verde-cooperativo)", fontFamily: "var(--font-noka)" }}
            >
              Puerto Rico
            </p>
            <h1
              className="text-3xl sm:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight"
              style={{ fontFamily: "var(--font-noka)" }}
            >
              Directorio de Cooperativas
            </h1>
            <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
              Descubre las cooperativas de tu comunidad en toda la isla.
            </p>
          </div>
        )}

        {/* Main layout: directory + optional sidebar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Directory column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-6">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--verde-impulso)", fontFamily: "var(--font-noka)" }}
                >
                  Cooperativas
                </h2>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cooperatives.length} registradas
                </span>
              </div>
              <CooperativeDirectory
                cooperatives={cooperatives}
                municipalities={municipalities}
              />
            </div>

            {/* Sidebar banners (lg+) */}
            {(sidebarTopBanners.length > 0 || sidebarBottomBanners.length > 0) && (
              <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-6">
                {sidebarTopBanners.length > 0 && <SidebarBanner banners={sidebarTopBanners} />}
                {sidebarBottomBanners.length > 0 && <SidebarBanner banners={sidebarBottomBanners} />}
              </aside>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
