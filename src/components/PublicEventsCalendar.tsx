"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CalendarView = "month" | "week" | "agenda";

type CalendarEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  infoUrl: string | null;
};

type Props = {
  events: CalendarEvent[];
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, mondayOffset));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export function PublicEventsCalendar({ events }: Props) {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(startOfDay(new Date()));

  const parsedEvents = useMemo(
    () =>
      events
        .map((event) => ({
          ...event,
          startsAtDate: new Date(event.startsAt),
          endsAtDate: event.endsAt ? new Date(event.endsAt) : null,
        }))
        .sort((a, b) => a.startsAtDate.getTime() - b.startsAtDate.getTime()),
    [events]
  );

  const monthStart = startOfMonth(cursor);
  const monthGridStart = startOfWeek(monthStart);
  const monthGridDays = Array.from({ length: 42 }, (_, i) => addDays(monthGridStart, i));

  const weekStart = startOfWeek(cursor);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const agendaStart = startOfDay(cursor);
  const agendaEnd = addDays(agendaStart, 45);

  const eventsInAgenda = parsedEvents.filter((event) => inRange(event.startsAtDate, agendaStart, agendaEnd));

  const goPrev = () => {
    if (view === "month") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
      return;
    }
    if (view === "week") {
      setCursor(addDays(cursor, -7));
      return;
    }
    setCursor(addDays(cursor, -14));
  };

  const goNext = () => {
    if (view === "month") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
      return;
    }
    if (view === "week") {
      setCursor(addDays(cursor, 7));
      return;
    }
    setCursor(addDays(cursor, 14));
  };

  const titleLabel =
    view === "month"
      ? cursor.toLocaleDateString("es-PR", { month: "long", year: "numeric" })
      : view === "week"
        ? `${weekStart.toLocaleDateString("es-PR", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("es-PR", { day: "numeric", month: "short", year: "numeric" })}`
        : `${agendaStart.toLocaleDateString("es-PR", { day: "numeric", month: "short" })} - ${agendaEnd.toLocaleDateString("es-PR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <section className="rounded-2xl border p-4 sm:p-6" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Calendario cooperativo
          </p>
          <h2 className="text-xl font-bold capitalize" style={{ color: "var(--verde-impulso)" }}>
            {titleLabel}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setCursor(startOfDay(new Date()))}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            Siguiente
          </button>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-xl border p-1" style={{ borderColor: "var(--border-subtle)", backgroundColor: "#f8fbf8" }}>
        {[
          { key: "month", label: "Mes" },
          { key: "week", label: "Semana" },
          { key: "agenda", label: "Agenda" },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setView(option.key as CalendarView)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
            style={
              view === option.key
                ? { backgroundColor: "var(--verde-impulso)", color: "white" }
                : { color: "var(--text-secondary)" }
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {view === "month" && (
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthGridDays.map((day) => {
              const dayEvents = parsedEvents.filter((event) => isSameDay(event.startsAtDate, day));
              const inCurrentMonth = day.getMonth() === monthStart.getMonth();
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className="min-h-24 rounded-lg border p-2"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: inCurrentMonth ? "#ffffff" : "#f6f8f6",
                    opacity: inCurrentMonth ? 1 : 0.65,
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className="text-xs font-semibold"
                      style={
                        isToday
                          ? {
                              backgroundColor: "var(--verde-cooperativo)",
                              color: "var(--verde-impulso)",
                              borderRadius: "999px",
                              padding: "0.1rem 0.45rem",
                            }
                          : { color: "var(--text-secondary)" }
                      }
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded px-1.5 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: "#d9edd8", color: "var(--verde-impulso)" }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        +{dayEvents.length - 2} mas
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          {weekDays.map((day) => {
            const dayEvents = parsedEvents.filter((event) => isSameDay(event.startsAtDate, day));
            const isToday = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()} className="rounded-lg border p-3" style={{ borderColor: "var(--border-subtle)", backgroundColor: "#ffffff" }}>
                <p className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
                  {WEEK_DAYS[(day.getDay() + 6) % 7]}
                </p>
                <p className="mb-2 text-sm font-bold" style={{ color: isToday ? "var(--azul-compromiso)" : "var(--verde-impulso)" }}>
                  {day.toLocaleDateString("es-PR", { day: "numeric", month: "short" })}
                </p>

                {dayEvents.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Sin eventos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <article key={event.id} className="rounded-md p-2" style={{ backgroundColor: "#d9edd8" }}>
                        <p className="text-xs font-semibold" style={{ color: "var(--verde-impulso)" }}>
                          {event.startsAtDate.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{event.title}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === "agenda" && (
        <div className="space-y-3">
          {eventsInAgenda.length === 0 ? (
            <p className="rounded-lg border px-4 py-6 text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
              No hay eventos en este periodo.
            </p>
          ) : (
            eventsInAgenda.map((event) => (
              <article key={event.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border-subtle)", backgroundColor: "#ffffff" }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--azul-compromiso)" }}>
                      {event.startsAtDate.toLocaleDateString("es-PR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {event.startsAtDate.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold" style={{ color: "var(--verde-impulso)" }}>
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {event.location}
                    </p>
                  </div>

                  {event.infoUrl && (
                    <Link
                      href={event.infoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                      style={{ backgroundColor: "var(--verde-impulso)", color: "white" }}
                    >
                      Ver detalle
                    </Link>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
