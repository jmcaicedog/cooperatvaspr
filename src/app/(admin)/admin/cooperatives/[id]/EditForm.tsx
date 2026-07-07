"use client";

import { ContactType, SocialPlatform } from "@prisma/client";
import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  addGalleryImageByAdminAction,
  type CooperativeActionState,
  type CooperativeMediaActionState,
  deleteGalleryImageByAdminAction,
  removeCooperativeLogoByAdminAction,
  setPrimaryGalleryImageByAdminAction,
  updateGalleryImageAltTextByAdminAction,
  uploadCooperativeLogoByAdminAction,
  updateCooperativeByAdminAction,
} from "@/app/(admin)/admin/cooperatives/actions";
import {
  createServiceAction,
  deleteServiceAction,
  toggleServiceAction,
  updateServiceAction,
} from "@/app/cooperativa/servicios/actions";
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
import { RichTextEditor } from "@/app/cooperativa/perfil/RichTextEditor";
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";
import { cooperativeTypeLabels, cooperativeTypeValues } from "@/lib/cooperative-taxonomy";
import { socialPlatformLabels, socialPlatformOptions } from "@/lib/social-links";

type CooperativeEditData = {
  id: string;
  name: string;
  municipalityCode: string;
  foundedYear: number | null;
  logoUrl: string | null;
  slogan: string | null;
  descriptionText: string | null;
  descriptionRich: unknown;
  cooperativeTypes: string[];
  tags: string[];
  services: Array<{
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
  }>;
  contacts: Array<{
    id: string;
    type: ContactType;
    label: string | null;
    value: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: SocialPlatform;
    url: string;
  }>;
  gallery: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
  }>;
};

type MunicipalityOption = {
  code: string;
  name: string;
};

const initialState: CooperativeActionState = {
  ok: false,
  message: "",
};

const initialMediaState: CooperativeMediaActionState = {
  ok: false,
  message: "",
};

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
        <path
          d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
          stroke="currentColor"
          strokeWidth="1.6"
        />
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

export function EditForm({
  cooperative,
  municipalities,
}: {
  cooperative: CooperativeEditData;
  municipalities: MunicipalityOption[];
}) {
  const router = useRouter();
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLogoName, setSelectedLogoName] = useState("");
  const [state, action, pending] = useActionState(updateCooperativeByAdminAction, initialState);
  const [logoState, logoAction, logoPending] = useActionState(
    uploadCooperativeLogoByAdminAction,
    initialMediaState
  );
  const [galleryState, galleryAction, galleryPending] = useActionState(
    addGalleryImageByAdminAction,
    initialMediaState
  );

  useEffect(() => {
    if (state.ok || logoState.ok || galleryState.ok) {
      router.refresh();
    }
  }, [galleryState.ok, logoState.ok, router, state.ok]);

  const galleryLimitReached = cooperative.gallery.length >= 5;
  const rich =
    cooperative.descriptionRich &&
    typeof cooperative.descriptionRich === "object" &&
    "html" in cooperative.descriptionRich &&
    "text" in cooperative.descriptionRich
      ? (cooperative.descriptionRich as { html: string; text: string })
      : { html: cooperative.descriptionText ?? "", text: cooperative.descriptionText ?? "" };

  return (
    <div className="admin-themed space-y-6">
      <AdminCard className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold">Logo</h3>
          <p className="text-xs text-zinc-600">Opcional. Formatos JPG, PNG o WEBP. Maximo 2 MB.</p>
        </header>

        {cooperative.logoUrl ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            <Image
              alt="Logo actual"
              className="object-contain"
              fill
              sizes="112px"
              src={cooperative.logoUrl}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No hay logo cargado.</p>
        )}

        <form action={logoAction} className="grid gap-3 md:max-w-md">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            name="logoFile"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setSelectedLogoName(file?.name ?? "");
            }}
            ref={logoFileInputRef}
            required
            type="file"
          />

          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              className="inline-flex items-center gap-2 rounded-md px-3 py-2"
              variant="secondary"
              onClick={() => logoFileInputRef.current?.click()}
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 5v14m-7-7h14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              Buscar archivo
            </AdminButton>

            <AdminButton
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 disabled:opacity-60"
              disabled={logoPending}
              type="submit"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 16V4m0 12 4-4m-4 4-4-4M5 20h14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              {logoPending ? "Cargando..." : "Cargar"}
            </AdminButton>
          </div>

          <p className="text-xs text-zinc-600">{selectedLogoName || "Ningun archivo seleccionado."}</p>
        </form>

        {cooperative.logoUrl ? (
          <form action={removeCooperativeLogoByAdminAction}>
            <input name="cooperativeId" type="hidden" value={cooperative.id} />
            <AdminButton className="inline-flex rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
              Quitar logo
            </AdminButton>
          </form>
        ) : null}

        {logoState.message ? (
          <p className={`text-sm ${logoState.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {logoState.message}
          </p>
        ) : null}
      </AdminCard>

      <form action={action} className="admin-card space-y-4 rounded-xl border p-6">
        <input name="cooperativeId" type="hidden" value={cooperative.id} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1 text-sm">
            <AdminLabel className="mb-0">Nombre</AdminLabel>
            <AdminInput
              defaultValue={cooperative.name}
              name="name"
              required
            />
          </div>

          <div className="grid gap-1 text-sm">
            <AdminLabel className="mb-0">Municipio</AdminLabel>
            <AdminSelect
              defaultValue={cooperative.municipalityCode}
              name="municipalityCode"
              required
            >
              {municipalities.map((municipality) => (
                <option key={municipality.code} value={municipality.code}>
                  {municipality.name}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>

        <div className="grid gap-1 text-sm">
          <AdminLabel className="mb-0">Slogan</AdminLabel>
          <AdminInput
            defaultValue={cooperative.slogan ?? ""}
            name="slogan"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <AdminLabel className="mb-0">Año de fundación</AdminLabel>
          <AdminInput
            defaultValue={cooperative.foundedYear ?? ""}
            max={new Date().getFullYear()}
            min={1700}
            name="foundedYear"
            placeholder="Ej. 1968"
            type="number"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <AdminLabel className="mb-0">Descripcion breve (texto plano)</AdminLabel>
          <AdminTextarea
            className="min-h-28"
            defaultValue={cooperative.descriptionText ?? ""}
            name="descriptionText"
          />
        </div>

        <fieldset className="grid gap-2 text-sm">
          <legend className="text-sm">Tipo de cooperativa</legend>
          <div className="grid gap-2 rounded-md border border-zinc-300 p-3">
            {cooperativeTypeValues.map((cooperativeType) => (
              <label className="inline-flex items-center gap-2" key={cooperativeType}>
                <input
                  defaultChecked={cooperative.cooperativeTypes.includes(cooperativeType)}
                  name="cooperativeTypes"
                  type="checkbox"
                  value={cooperativeType}
                />
                <span>{cooperativeTypeLabels[cooperativeType]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-1 text-sm">
          <AdminLabel className="mb-0">Palabras clave (tags)</AdminLabel>
          <AdminInput
            defaultValue={cooperative.tags.join(", ")}
            name="tags"
            placeholder="Ej. cafe, turismo, agroecologia"
          />
          <span className="text-xs text-zinc-500">Separa cada palabra clave por coma.</span>
        </div>

        <div className="grid gap-1 text-sm">
          <span>Descripcion enriquecida</span>
          <RichTextEditor defaultHtml={rich.html} defaultText={rich.text} name="descriptionRich" />
        </div>

        <AdminButton className="inline-flex rounded-md px-4 py-2 disabled:opacity-60" disabled={pending} type="submit">
          {pending ? "Guardando..." : "Guardar cambios"}
        </AdminButton>

        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>
        ) : null}
      </form>

      <AdminCard className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold">Galeria de imagenes</h3>
          <p className="text-xs text-zinc-600">
            Opcional. Maximo 5 fotos por cooperativa. Formatos JPG, PNG o WEBP. Maximo 5 MB por imagen.
          </p>
          <p className="text-xs font-medium text-zinc-700">{cooperative.gallery.length}/5 imagenes</p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cooperative.gallery.length === 0 ? (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              No hay imagenes en la galeria.
            </article>
          ) : (
            cooperative.gallery.map((image) => (
              <article className="rounded-lg border border-zinc-200 bg-white p-3" key={image.id}>
                <div className="relative h-40 w-full overflow-hidden rounded-md bg-zinc-100">
                  <Image
                    alt={image.altText ?? "Imagen de galeria"}
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    src={image.imageUrl}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-600">{image.altText ?? "Sin texto alternativo"}</p>
                <p className="mt-1 text-xs font-medium text-zinc-700">
                  {image.isPrimary ? "Imagen principal" : "Imagen secundaria"}
                </p>

                <form action={updateGalleryImageAltTextByAdminAction} className="mt-3 grid gap-2">
                  <input name="imageId" type="hidden" value={image.id} />
                  <AdminInput
                    className="text-xs"
                    defaultValue={image.altText ?? ""}
                    maxLength={200}
                    name="altText"
                    placeholder="Texto alternativo"
                  />
                  <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
                    Guardar texto alternativo
                  </AdminButton>
                </form>

                <div className="mt-3 flex gap-2">
                  {!image.isPrimary ? (
                    <form action={setPrimaryGalleryImageByAdminAction}>
                      <input name="imageId" type="hidden" value={image.id} />
                      <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
                        Marcar principal
                      </AdminButton>
                    </form>
                  ) : null}

                  <form action={deleteGalleryImageByAdminAction}>
                    <input name="imageId" type="hidden" value={image.id} />
                    <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="danger">
                      Eliminar
                    </AdminButton>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <form action={galleryAction} className="grid gap-3 rounded-md border border-zinc-200 p-4 md:max-w-lg">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <AdminInput
            accept="image/jpeg,image/png,image/webp"
            disabled={galleryLimitReached || galleryPending}
            name="galleryFile"
            required
            type="file"
          />
          <AdminInput
            disabled={galleryLimitReached || galleryPending}
            maxLength={200}
            name="altText"
            placeholder="Texto alternativo (opcional)"
          />
          <AdminButton
            className="inline-flex rounded-md px-4 py-2 disabled:opacity-60"
            disabled={galleryLimitReached || galleryPending}
            type="submit"
          >
            {galleryPending ? "Subiendo..." : "Agregar imagen"}
          </AdminButton>
          {galleryLimitReached ? (
            <p className="text-xs text-amber-700">Se alcanzo el limite de 5 imagenes.</p>
          ) : null}
        </form>

        {galleryState.message ? (
          <p className={`text-sm ${galleryState.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {galleryState.message}
          </p>
        ) : null}
      </AdminCard>

      <AdminCard className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold">Servicios</h3>
          <p className="text-xs text-zinc-600">Gestiona los servicios desde esta misma pantalla.</p>
        </header>

        <div className="space-y-3">
          {cooperative.services.length === 0 ? (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Aun no hay servicios cargados.
            </article>
          ) : (
            cooperative.services.map((service, index) => (
              <article className="rounded-lg border border-zinc-200 bg-white p-4" key={service.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-xs font-semibold text-zinc-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <form action={updateServiceAction} className="grid gap-2">
                      <input name="serviceId" type="hidden" value={service.id} />
                      <AdminInput
                        defaultValue={service.title}
                        name="title"
                        placeholder="Titulo del servicio"
                        required
                      />
                      <AdminTextarea
                        className="min-h-20"
                        defaultValue={service.description ?? ""}
                        name="description"
                        placeholder="Descripcion"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
                          Guardar edicion
                        </AdminButton>
                        <p className="text-xs text-zinc-500">{service.isActive ? "Activo" : "Inactivo"}</p>
                      </div>
                    </form>

                    <div className="flex gap-2">
                      <form action={toggleServiceAction.bind(null, service.id)}>
                        <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
                          {service.isActive ? "Desactivar" : "Activar"}
                        </AdminButton>
                      </form>

                      <form action={deleteServiceAction.bind(null, service.id)}>
                        <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="danger">
                          Eliminar
                        </AdminButton>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <form action={createServiceAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nuevo servicio</h4>
          <AdminInput
            name="title"
            placeholder="Titulo del servicio"
            required
          />
          <AdminTextarea
            className="min-h-24"
            name="description"
            placeholder="Descripcion"
          />
          <AdminButton className="rounded-md px-4 py-2" type="submit">
            Agregar servicio
          </AdminButton>
        </form>
      </AdminCard>

      <AdminCard className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold">Contactos</h3>
          <p className="text-xs text-zinc-600">Administra contactos con el mismo flujo del panel cooperativa.</p>
        </header>

        <div className="space-y-3">
          {cooperative.contacts.length === 0 ? (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Aun no hay contactos cargados.
            </article>
          ) : (
            cooperative.contacts.map((contact) => (
              <article className="rounded-lg border border-zinc-200 bg-white p-4" key={contact.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700">
                    <ContactTypeIcon type={contact.type} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <form action={updateContactAction} className="grid gap-2">
                      <input name="contactId" type="hidden" value={contact.id} />

                      <AdminSelect
                        defaultValue={contact.type}
                        name="type"
                        required
                      >
                        <option value={ContactType.PHONE}>Telefono</option>
                        <option value={ContactType.EMAIL}>Correo</option>
                        <option value={ContactType.WEBSITE}>Sitio web</option>
                        <option value={ContactType.WHATSAPP}>WhatsApp</option>
                        <option value={ContactType.ADDRESS}>Direccion</option>
                      </AdminSelect>

                      <AdminInput
                        defaultValue={contact.label ?? ""}
                        name="label"
                        placeholder="Etiqueta (opcional)"
                      />

                      <AdminInput
                        defaultValue={contact.value}
                        name="value"
                        placeholder="Valor de contacto"
                        required
                      />

                      <AdminButton className="w-fit rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
                        Guardar edicion
                      </AdminButton>
                    </form>

                    <form action={deleteContactAction.bind(null, contact.id)}>
                      <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="danger">
                        Eliminar
                      </AdminButton>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <form action={createContactAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nuevo contacto</h4>

          <AdminSelect name="type" required>
            <option value={ContactType.PHONE}>Telefono</option>
            <option value={ContactType.EMAIL}>Correo</option>
            <option value={ContactType.WEBSITE}>Sitio web</option>
            <option value={ContactType.WHATSAPP}>WhatsApp</option>
            <option value={ContactType.ADDRESS}>Direccion</option>
          </AdminSelect>

          <AdminInput
            name="label"
            placeholder="Etiqueta (opcional)"
          />

          <AdminInput
            name="value"
            placeholder="Valor de contacto"
            required
          />

          <AdminButton className="rounded-md px-4 py-2" type="submit">
            Agregar contacto
          </AdminButton>
        </form>
      </AdminCard>

      <AdminCard className="space-y-4 p-6">
        <header className="space-y-1">
          <h3 className="text-base font-semibold">Redes sociales</h3>
          <p className="text-xs text-zinc-600">Agrega enlaces por plataforma para mostrarlos en la ficha pública.</p>
        </header>

        <div className="space-y-3">
          {cooperative.socialLinks.length === 0 ? (
            <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Aun no hay redes sociales cargadas.
            </article>
          ) : (
            cooperative.socialLinks.map((socialLink) => (
              <article className="rounded-lg border border-zinc-200 bg-white p-4" key={socialLink.id}>
                <form action={updateSocialLinkAction} className="grid gap-2">
                  <input name="socialLinkId" type="hidden" value={socialLink.id} />

                  <AdminSelect defaultValue={socialLink.platform} name="platform" required>
                    {socialPlatformOptions.map((platform) => (
                      <option key={platform} value={platform}>
                        {socialPlatformLabels[platform]}
                      </option>
                    ))}
                  </AdminSelect>

                  <AdminInput defaultValue={socialLink.url} name="url" placeholder="https://..." required />

                  <div className="flex flex-wrap gap-2">
                    <AdminButton className="w-fit rounded-md px-3 py-1.5 text-xs" type="submit" variant="secondary">
                      Guardar edicion
                    </AdminButton>
                  </div>
                </form>

                <form action={deleteSocialLinkAction.bind(null, socialLink.id)} className="mt-3">
                  <AdminButton className="rounded-md px-3 py-1.5 text-xs" type="submit" variant="danger">
                    Eliminar
                  </AdminButton>
                </form>
              </article>
            ))
          )}
        </div>

        <form action={createSocialLinkAction} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <input name="cooperativeId" type="hidden" value={cooperative.id} />
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nueva red social</h4>

          <AdminSelect defaultValue={SocialPlatform.FACEBOOK} name="platform" required>
            {socialPlatformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {socialPlatformLabels[platform]}
              </option>
            ))}
          </AdminSelect>

          <AdminInput name="url" placeholder="https://..." required />

          <AdminButton className="rounded-md px-4 py-2" type="submit">
            Agregar red social
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}