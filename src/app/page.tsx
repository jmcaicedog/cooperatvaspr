import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { HeroBanner, SidebarBanner, type BannerItem } from "@/components/BannerComponents";
import { CooperativeDirectory } from "@/components/CooperativeDirectory";
import { db } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platform-settings";
import { CooperativeStatus, PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

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
  const settings = await getPlatformSettings();

  if (settings.comingSoonEnabled) {
    return (
      <ComingSoonPage
        message={settings.comingSoonMessage}
        launchAtIso={settings.comingSoonLaunchAt ? settings.comingSoonLaunchAt.toISOString() : null}
      />
    );
  }

  const now = new Date();
  const [
    heroBanners,
    sidebarTopBanners,
    sidebarBottomBanners,
    rawCoops,
    municipalities,
    upcomingEvents,
    testimonials,
    latestPosts,
  ] =
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
      settings.homeShowEvents
        ? db.event.findMany({
            where: { isPublished: true, startsAt: { gte: now } },
            orderBy: { startsAt: "asc" },
            take: 3,
            select: {
              id: true,
              title: true,
              location: true,
              startsAt: true,
              endsAt: true,
              coverImageUrl: true,
              infoUrl: true,
            },
          })
        : Promise.resolve([]),
      settings.homeShowTestimonials
        ? db.testimonial.findMany({
            where: { isPublished: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            take: 3,
            select: {
              id: true,
              authorName: true,
              authorRole: true,
              authorOrganization: true,
              avatarUrl: true,
              body: true,
            },
          })
        : Promise.resolve([]),
      settings.homeShowBlog
        ? db.blogPost.findMany({
            where: {
              status: PostStatus.PUBLISHED,
              OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 3,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImageUrl: true,
              publishedAt: true,
              category: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
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
      <SiteHeader showEventsLink={settings.homeShowEvents} showBlogLink={settings.homeShowBlog} />
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
        <div id="directorio" className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
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

        {/* Próximos eventos */}
        {settings.homeShowEvents ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--verde-impulso)" }}>
                Próximos eventos
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Actividades y encuentros del movimiento cooperativo.
              </p>
            </div>
            <Link href="/eventos" className="text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
              Ver calendario →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border px-5 py-8 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
              Aún no hay eventos programados.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
                  <div className="relative h-36 w-full" style={{ backgroundColor: "#e6efe8" }}>
                    {event.coverImageUrl ? (
                      <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--verde-impulso)" }}>
                        Evento
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--azul-compromiso)" }}>
                      {event.startsAt.toLocaleDateString("es-PR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--verde-impulso)" }}>
                      {event.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{event.location}</p>
                    <Link href={event.infoUrl || "/eventos"} target={event.infoUrl ? "_blank" : undefined} rel={event.infoUrl ? "noopener noreferrer" : undefined} className="inline-flex pt-1 text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
                      {event.infoUrl ? "Más información" : "Ver en calendario"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        ) : null}

        {/* Testimonios */}
        {settings.homeShowTestimonials ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold" style={{ color: "var(--verde-impulso)" }}>
              Testimonios
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Voces de personas y organizaciones que viven el cooperativismo.
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="rounded-2xl border px-5 py-8 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
              Aún no hay testimonios publicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
                  <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
                    “{testimonial.body}”
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    {testimonial.avatarUrl ? (
                      <Image src={testimonial.avatarUrl} alt={testimonial.authorName} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: "#d9edd8", color: "var(--verde-impulso)" }}>
                        {testimonial.authorName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--verde-impulso)" }}>{testimonial.authorName}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {[testimonial.authorRole, testimonial.authorOrganization].filter(Boolean).join(" · ") || "Comunidad cooperativa"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        ) : null}

        {/* Últimos artículos */}
        {settings.homeShowBlog ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--verde-impulso)" }}>
                Últimos artículos
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Noticias, análisis y aprendizajes del ecosistema cooperativo.
              </p>
            </div>
            <Link href="/blog" className="text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
              Ver blog →
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="rounded-2xl border px-5 py-8 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
              Aún no hay artículos publicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {latestPosts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
                  <div className="relative h-36 w-full" style={{ backgroundColor: "#e6ecef" }}>
                    {post.coverImageUrl ? (
                      <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--azul-compromiso)" }}>
                        Blog
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {post.category.name}
                      {post.publishedAt ? ` · ${post.publishedAt.toLocaleDateString("es-PR")}` : ""}
                    </p>
                    <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--verde-impulso)" }}>
                      {post.title}
                    </h3>
                    <p className="line-clamp-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {post.excerpt || "Lee este artículo completo en nuestro blog."}
                    </p>
                    <Link href={`/blog/${post.slug}`} className="inline-flex pt-1 text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
                      Leer artículo →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        ) : null}
      </main>
      <SiteFooter showEventsLink={settings.homeShowEvents} showBlogLink={settings.homeShowBlog} />
    </>
  );
}
