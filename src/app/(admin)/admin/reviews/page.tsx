import { ChangeRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { reviewChangeRequestAction } from "@/app/cooperativa/perfil/actions";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

type RequestedPayload = {
  name?: string;
  municipalityCode?: string;
  slogan?: string | null;
  descriptionText?: string | null;
  descriptionRich?: { text?: string; html?: string } | null;
};

function normalizeValue(value: string | null | undefined): string {
  if (!value) {
    return "(vacio)";
  }

  return value;
}

function toPayload(payload: unknown): RequestedPayload {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  return payload as RequestedPayload;
}

function severityLabel(raw: string): string {
  if (raw === "MAJOR") {
    return "Mayor";
  }

  if (raw === "MINOR") {
    return "Menor";
  }

  return raw;
}

export default async function ReviewsPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">
          Solo un usuario PLATFORM_ADMIN puede revisar solicitudes.
        </p>
        <a className="mt-4 inline-flex rounded-md bg-zinc-900 px-3 py-2 text-sm text-white" href="/login">
          Ir a login
        </a>
      </section>
    );
  }

  const pending = await db.cooperativeChangeRequest.findMany({
    where: { status: ChangeRequestStatus.PENDING },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      severity: true,
      createdAt: true,
      notes: true,
      payload: true,
      cooperative: {
        select: {
          name: true,
          slug: true,
          municipalityCode: true,
          municipality: {
            select: {
              name: true,
            },
          },
          slogan: true,
          descriptionText: true,
          descriptionRich: true,
        },
      },
      requestedBy: {
        select: { email: true, displayName: true },
      },
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Revisión de cambios mayores</h2>
        <p className="text-sm text-zinc-600">
          {pending.length === 0
            ? "Sin solicitudes pendientes"
            : `${pending.length} solicitud${pending.length === 1 ? "" : "es"} pendiente${pending.length === 1 ? "" : "s"} de revisión`}
        </p>
      </header>

      <div className="space-y-3">
        {pending.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No hay solicitudes pendientes.
          </article>
        ) : (
          pending.map((item) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={item.id}>
              {(() => {
                const payload = toPayload(item.payload);
                const currentRichText =
                  item.cooperative.descriptionRich &&
                  typeof item.cooperative.descriptionRich === "object" &&
                  "text" in item.cooperative.descriptionRich
                    ? String((item.cooperative.descriptionRich as { text?: string }).text ?? "")
                    : "";

                const proposedRichText = payload.descriptionRich?.text ?? "";

                const changes = [
                  {
                    label: "Nombre",
                    from: item.cooperative.name,
                    to: payload.name ?? item.cooperative.name,
                  },
                  {
                    label: "Municipio",
                    from: item.cooperative.municipality?.name ?? item.cooperative.municipalityCode,
                    to: payload.municipalityCode ?? item.cooperative.municipalityCode,
                  },
                  {
                    label: "Slogan",
                    from: item.cooperative.slogan ?? "",
                    to: payload.slogan ?? "",
                  },
                  {
                    label: "Descripcion breve",
                    from: item.cooperative.descriptionText ?? "",
                    to: payload.descriptionText ?? "",
                  },
                  {
                    label: "Descripcion enriquecida (texto)",
                    from: currentRichText,
                    to: proposedRichText,
                  },
                ].filter((change) => change.from !== change.to);

                return (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.cooperative.name}</p>
                  <p className="text-xs text-zinc-500">/{item.cooperative.slug}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Solicitado por {item.requestedBy.displayName} ({item.requestedBy.email})
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">Severidad: {severityLabel(item.severity)}</p>

                  <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                      Cambios solicitados
                    </p>
                    {changes.length === 0 ? (
                      <p className="mt-1 text-xs text-zinc-600">
                        No se detectaron diferencias campo a campo en el payload.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-xs text-zinc-700">
                        {changes.map((change) => (
                          <li key={change.label}>
                            <p className="font-medium">{change.label}</p>
                            <p className="text-zinc-500">Actual: {normalizeValue(change.from)}</p>
                            <p>Solicitado: {normalizeValue(change.to)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await reviewChangeRequestAction(item.id, "approve");
                      revalidatePath("/admin/reviews");
                    }}
                  >
                    <button
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                      type="submit"
                    >
                      Aprobar
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await reviewChangeRequestAction(item.id, "reject");
                      revalidatePath("/admin/reviews");
                    }}
                  >
                    <button
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
                      type="submit"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
                );
              })()}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
