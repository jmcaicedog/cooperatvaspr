import Link from "next/link";
import { db } from "@/lib/db";
import { PublicEventsCalendar } from "@/components/PublicEventsCalendar";

export const metadata = {
  title: "Eventos cooperativos",
  description: "Calendario de actividades, encuentros y eventos del ecosistema cooperativo.",
};

export default async function EventosPage() {
  const events = await db.event.findMany({
    where: { isPublished: true },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      location: true,
      startsAt: true,
      endsAt: true,
      infoUrl: true,
    },
  });

  const now = new Date();
  const upcomingCount = events.filter((event) => event.startsAt >= now).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-7 rounded-2xl p-6 sm:p-7" style={{ background: "linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--verde-cooperativo)" }}>
          Agenda cooperativa
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Eventos</h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.8)" }}>
          Consulta las actividades por mes, semana o en formato agenda para planificar tu participacion.
        </p>
        <p className="mt-3 text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
          {upcomingCount} proximo(s) de {events.length} evento(s) publicados.
        </p>
      </header>

      <PublicEventsCalendar
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          location: event.location,
          startsAt: event.startsAt.toISOString(),
          endsAt: event.endsAt ? event.endsAt.toISOString() : null,
          infoUrl: event.infoUrl,
        }))}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
          Volver al inicio
        </Link>
        <span style={{ color: "var(--text-muted)" }}>•</span>
        <Link href="/contacto" className="text-sm font-semibold" style={{ color: "var(--azul-compromiso)" }}>
          Proponer un evento
        </Link>
      </div>
    </div>
  );
}
