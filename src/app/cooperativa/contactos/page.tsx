import { ContactType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
} from "@/app/cooperativa/contactos/actions";
import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  updateSocialLinkAction,
} from "@/app/cooperativa/redes/actions";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { getScopedCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";
import { socialPlatformLabels, socialPlatformOptions } from "@/lib/social-links";

function ContactTypeIcon({ type }: { type: ContactType }) {
  if (type === ContactType.PHONE || type === ContactType.WHATSAPP) {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M5 4h4l2 5-2.5 1.5a14 14 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2C10.3 21 3 13.7 3 6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (type === ContactType.EMAIL) {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 6h16v12H4z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
        <path
          d="m4 8 8 6 8-6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (type === ContactType.WEBSITE) {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" fill="currentColor" r="2" />
    </svg>
  );
}

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
    where: { cooperativeId: cooperative.id, type: { not: ContactType.ADDRESS } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      type: true,
      label: true,
      value: true,
    },
  });

  const socialLinks = await db.socialLink.findMany({
    where: { cooperativeId: cooperative.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      platform: true,
      url: true,
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Contactos</h1>
        <p className="text-sm text-zinc-600">Cooperativa: {cooperative.name}</p>
      </header>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Aun no hay contactos cargados.
          </article>
        ) : (
          contacts.map((contact) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={contact.id}>
              <div className="flex items-start gap-3">
                <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700">
                  <ContactTypeIcon type={contact.type} />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <form action={updateContactAction} className="grid gap-2">
                    <input name="contactId" type="hidden" value={contact.id} />

                    <select
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      defaultValue={contact.type}
                      name="type"
                      required
                    >
                      <option value={ContactType.PHONE}>Telefono</option>
                      <option value={ContactType.EMAIL}>Correo</option>
                      <option value={ContactType.WEBSITE}>Sitio web</option>
                      <option value={ContactType.WHATSAPP}>WhatsApp</option>
                    </select>

                    <input
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      defaultValue={contact.label ?? ""}
                      name="label"
                      placeholder="Etiqueta (opcional)"
                    />

                    <input
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      defaultValue={contact.value}
                      name="value"
                      placeholder="Valor de contacto"
                      required
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                        type="submit"
                      >
                        Guardar edicion
                      </button>
                    </div>
                  </form>

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
              </div>
            </article>
          ))
        )}
      </div>

      <form action={createContactAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <input name="cooperativeId" type="hidden" value={cooperative.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nuevo contacto</h2>

        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" name="type" required>
          <option value={ContactType.PHONE}>Telefono</option>
          <option value={ContactType.EMAIL}>Correo</option>
          <option value={ContactType.WEBSITE}>Sitio web</option>
          <option value={ContactType.WHATSAPP}>WhatsApp</option>
        </select>

        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="label"
          placeholder="Etiqueta (opcional)"
        />

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
        {socialLinks.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Aun no hay redes sociales cargadas.
          </article>
        ) : (
          socialLinks.map((socialLink) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-4" key={socialLink.id}>
              <form action={updateSocialLinkAction} className="grid gap-2">
                <input name="socialLinkId" type="hidden" value={socialLink.id} />

                <select
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  defaultValue={socialLink.platform}
                  name="platform"
                  required
                >
                  {socialPlatformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {socialPlatformLabels[platform]}
                    </option>
                  ))}
                </select>

                <input
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  defaultValue={socialLink.url}
                  name="url"
                  placeholder="https://..."
                  required
                />

                <button
                  className="w-fit rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                  type="submit"
                >
                  Guardar edicion
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await deleteSocialLinkAction(socialLink.id);
                  revalidatePath("/cooperativa/contactos");
                }}
                className="mt-3"
              >
                <button className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white" type="submit">
                  Eliminar
                </button>
              </form>
            </article>
          ))
        )}
      </div>

      <form action={createSocialLinkAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <input name="cooperativeId" type="hidden" value={cooperative.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nueva red social</h2>

        <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" defaultValue={socialPlatformOptions[0]} name="platform" required>
          {socialPlatformOptions.map((platform) => (
            <option key={platform} value={platform}>
              {socialPlatformLabels[platform]}
            </option>
          ))}
        </select>

        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="url"
          placeholder="https://..."
          required
        />

        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Agregar red social
        </button>
      </form>
    </section>
  );
}