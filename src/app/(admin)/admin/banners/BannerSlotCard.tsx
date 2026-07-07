"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";

import {
  createBannerAction,
  deleteBannerAction,
  type BannerActionState,
  toggleBannerActiveAction,
} from "@/app/(admin)/admin/banners/actions";
import type { BannerSlotKey } from "@/lib/banner-config";

type BannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  targetUrl: string | null;
};

type BannerSlotCardProps = {
  slot: BannerSlotKey;
  slotLabel: string;
  slotDescription: string;
  requiredSize: string;
  maxImages: number;
  banners: BannerItem[];
};

const initialState: BannerActionState = {
  ok: false,
  message: "",
};

export function BannerSlotCard({
  slot,
  slotLabel,
  slotDescription,
  requiredSize,
  maxImages,
  banners,
}: BannerSlotCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [state, createAction, pending] = useActionState(createBannerAction, initialState);

  const limitReached = banners.length >= maxImages;

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-4">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">{slotLabel}</h3>
        <p className="text-xs text-zinc-600">{slotDescription}</p>
        <p className="text-xs text-zinc-700">Tamaño requerido: {requiredSize}</p>
        <p className="text-xs text-zinc-700">
          {banners.length}/{maxImages} imágenes
        </p>
      </header>

      <div className="mt-3 space-y-3">
        {banners.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500">
            Sin banners configurados aún.
          </p>
        ) : (
          banners.map((banner) => (
            <div className="rounded-md border border-zinc-200 p-3" key={banner.id}>
              <div className="relative h-28 w-full overflow-hidden rounded-md bg-zinc-100">
                <Image
                  alt={banner.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1280px) 100vw, 33vw"
                  src={banner.imageUrl}
                />
              </div>
              <p className="mt-2 text-sm font-medium">{banner.title}</p>
              <p className="text-xs text-zinc-500">{banner.targetUrl ?? "Sin enlace"}</p>
              <p className="mt-1 text-xs">{banner.isActive ? "Activo" : "Inactivo"}</p>

              <div className="mt-2 flex gap-2">
                <form action={toggleBannerActiveAction.bind(null, banner.id)}>
                  <button
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100"
                    type="submit"
                  >
                    {banner.isActive ? "Desactivar" : "Activar"}
                  </button>
                </form>
                <form action={deleteBannerAction.bind(null, banner.id)}>
                  <button
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={(event) => {
                      if (!window.confirm("¿Eliminar este banner?")) {
                        event.preventDefault();
                      }
                    }}
                    type="submit"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <form action={createAction} className="mt-4 grid min-w-0 gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <input name="slot" type="hidden" value={slot} />
        <input
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          disabled={limitReached || pending}
          name="title"
          placeholder="Título del banner"
          required
        />
        <input
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          disabled={limitReached || pending}
          name="targetUrl"
          placeholder="https://enlace-opcional.com"
          type="url"
        />

        <input
          accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          disabled={limitReached || pending}
          name="imageFile"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setSelectedFileName(file?.name ?? "");
          }}
          ref={fileInputRef}
          required
          type="file"
        />

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:opacity-60"
          disabled={limitReached || pending}
          onClick={() => fileInputRef.current?.click()}
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
        </button>

        <p className="text-xs text-zinc-600">{selectedFileName || "Ningún archivo seleccionado."}</p>

        <button
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          disabled={limitReached || pending}
          type="submit"
        >
          {pending ? "Subiendo..." : "Agregar banner"}
        </button>
        {limitReached ? (
          <p className="text-xs text-amber-700">Se alcanzó el límite de imágenes para este slot.</p>
        ) : null}
        {state.message ? (
          <p className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>
        ) : null}
      </form>
    </article>
  );
}
