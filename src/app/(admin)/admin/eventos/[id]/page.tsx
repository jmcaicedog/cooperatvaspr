import { notFound } from "next/navigation";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { EditEventForm } from "./EditEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      location: true,
      descriptionHtml: true,
      descriptionText: true,
      coverImageUrl: true,
      startsAt: true,
      endsAt: true,
      infoUrl: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Editar evento</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Actualizado el{" "}
          {event.updatedAt.toLocaleDateString("es-PR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <EditEventForm event={event} />
    </div>
  );
}
