import Link from "next/link";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { CreateEventForm } from "./CreateEventForm";

export default async function EventosPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">Esta vista requiere iniciar sesión con un usuario PLATFORM_ADMIN.</p>
      </section>
    );
  }

  const events = await db.event.findMany({
    orderBy: [{ startsAt: "asc" }],
    select: {
      id: true,
      title: true,
      location: true,
      startsAt: true,
      endsAt: true,
      isPublished: true,
    },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.startsAt >= now);
  const past = events.filter((e) => e.startsAt < now);
  const sorted = [...upcoming, ...past];

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("es-PR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "#0f2c24" }}>Eventos</h1>
        <p className="mt-1 text-sm" style={{ color: "#4e6d62" }}>
          {upcoming.length} próximo(s) · {past.length} pasado(s)
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#d7e4dd" }}>
        {sorted.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Aún no hay eventos. Crea el primero abajo.
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-zinc-100 md:hidden">
              {sorted.map((event) => {
                const isPast = event.startsAt < now;
                return (
                  <div
                    className={`flex items-start justify-between gap-3 p-4 ${isPast ? "opacity-60" : ""}`}
                    key={event.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-900">{event.title}</p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{event.location}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${event.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}
                        >
                          {event.isPublished ? "Publicado" : "Borrador"}
                        </span>
                        {isPast && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                            Pasado
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">{fmtDate(event.startsAt)}</span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/eventos/${event.id}`}
                      className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                    >
                      Editar
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Evento</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Ubicación</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-600">Estado</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-600">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sorted.map((event) => {
                    const isPast = event.startsAt < now;
                    return (
                      <tr key={event.id} className={`hover:bg-zinc-50 ${isPast ? "opacity-60" : ""}`}>
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          <div className="max-w-xs truncate">{event.title}</div>
                        </td>
                        <td className="max-w-40 truncate px-4 py-3 text-zinc-600">
                          {event.location}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          <div>{fmtDate(event.startsAt)}</div>
                          {event.endsAt && (
                            <div className="text-xs text-zinc-400">hasta {fmtDate(event.endsAt)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${event.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}
                          >
                            {event.isPublished ? "Publicado" : "Borrador"}
                          </span>
                          {isPast && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                              Pasado
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/eventos/${event.id}`}
                            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Formulario crear evento */}
      <section className="rounded-xl border bg-white p-6" style={{ borderColor: "#d7e4dd" }}>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "#0f2c24" }}>Nuevo evento</h2>
        <CreateEventForm />
      </section>
    </div>
  );
}
