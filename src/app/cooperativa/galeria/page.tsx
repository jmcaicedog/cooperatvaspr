import Image from "next/image";
import { revalidatePath } from "next/cache";

import {
  createGalleryImageAction,
  deleteGalleryImageAction,
  setPrimaryGalleryImageAction,
  updateGalleryImageAltTextAction,
} from "@/app/cooperativa/galeria/actions";
import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { getScopedCooperative } from "@/lib/cooperative-scope";
import { db } from "@/lib/db";

export default async function CooperativaGaleriaPage() {
  const actor = await requireCoopAdminOrPlatform();
  const cooperative = await getScopedCooperative(actor);

  if (!cooperative) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        No hay cooperativa asignada para gestionar galeria.
      </section>
    );
  }

  const gallery = await db.galleryImage.findMany({
    where: { cooperativeId: cooperative.id },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      imageUrl: true,
      altText: true,
      isPrimary: true,
    },
  });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Galeria</h1>
        <p className="text-sm text-zinc-600">Cooperativa: {cooperative.name}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gallery.length === 0 ? (
          <article className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Aun no hay imagenes cargadas.
          </article>
        ) : (
          gallery.map((image) => (
            <article className="rounded-lg border border-zinc-200 bg-white p-3" key={image.id}>
              <div className="relative h-44 w-full overflow-hidden rounded-md bg-zinc-100">
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

              <form action={updateGalleryImageAltTextAction} className="mt-3 grid gap-2">
                <input name="imageId" type="hidden" value={image.id} />
                <input
                  className="rounded-md border border-zinc-300 px-3 py-2 text-xs"
                  defaultValue={image.altText ?? ""}
                  name="altText"
                  placeholder="Texto alternativo"
                />
                <button className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs" type="submit">
                  Guardar texto alternativo
                </button>
              </form>

              <div className="mt-3 flex gap-2">
                {!image.isPrimary ? (
                  <form
                    action={async () => {
                      "use server";
                      await setPrimaryGalleryImageAction(image.id);
                      revalidatePath("/cooperativa/galeria");
                    }}
                  >
                    <button
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium"
                      type="submit"
                    >
                      Marcar principal
                    </button>
                  </form>
                ) : null}

                <form
                  action={async () => {
                    "use server";
                    await deleteGalleryImageAction(image.id);
                    revalidatePath("/cooperativa/galeria");
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

      <form
        action={createGalleryImageAction}
        className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <input name="cooperativeId" type="hidden" value={cooperative.id} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Nueva imagen</h2>

        <input
          accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="imageFile"
          required
          type="file"
        />
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          name="altText"
          placeholder="Texto alternativo (opcional)"
        />

        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Cargar imagen
        </button>
      </form>
    </section>
  );
}