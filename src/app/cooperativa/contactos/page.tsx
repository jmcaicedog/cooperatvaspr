import { ContactType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { createContactAction, deleteContactAction } from "@/app/cooperativa/contactos/actions";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { getScopedCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

export default async function CooperativaContactosPage() {
  const actor = await requireCoopAdminOrPlatform();
  const cooperative = await getScopedCooperative(actor);

  if (!cooperative) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        No hay cooperativa asignada para gestionar contactos.
      </section>
    );
  }

  const contacts = await db.contactPoint.findMany({
    where: { cooperativeId: cooperative.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      type: true,
      label: true,
      value: true,
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Contactos</h1>
        <p className="text-sm text-zinc-600">Cooperativa: {cooperative.name}</p>
      </header>

      <form action={createContactAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <input name="cooperativeId" type="hidden" value={cooperative.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nuevo contacto</h2>

        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" name="type" required>
          <option value={ContactType.PHONE}>Telefono</option>
          <option value={ContactType.EMAIL}>Correo</option>
          <option value={ContactType.WEBSITE}>Sitio web</option>
          <option value={ContactType.WHATSAPP}>WhatsApp</option>
          <option value={ContactType.ADDRESS}>Direccion</option>
        </select>

        <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm" name="label" placeholder="Etiqueta (opcional)" />

        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="value"
          placeholder="Valor de contacto"
          required
        />

        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Agregar contacto
        </button>
      </form>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Aun no hay contactos cargados.
          </article>
        ) : (
          contacts.map((contact) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={contact.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{contact.type}</p>
                  <p className="text-sm text-zinc-600">{contact.label ?? "Sin etiqueta"}</p>
                  <p className="text-sm text-zinc-800">{contact.value}</p>
                </div>

                <form
                  action={async () => {
                    "use server";
                    await deleteContactAction(contact.id);
                    revalidatePath("/cooperativa/contactos");
                  }}
                >
                  <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white" type="submit">
                    Eliminar
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}