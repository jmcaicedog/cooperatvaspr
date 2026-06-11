"use client";

import { useMemo, useState } from "react";

import { deleteCooperativeByPlatformAction } from "@/app/(admin)/admin/cooperatives/actions";

type ConfirmDeleteCooperativeButtonProps = {
  cooperativeId: string;
  cooperativeName: string;
  triggerClassName?: string;
};

const CONFIRM_TEXT = "ELIMINAR";

export function ConfirmDeleteCooperativeButton({
  cooperativeId,
  cooperativeName,
  triggerClassName,
}: ConfirmDeleteCooperativeButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");

  const deleteAction = useMemo(
    () => deleteCooperativeByPlatformAction.bind(null, cooperativeId),
    [cooperativeId]
  );
  const canConfirm = confirmValue.trim().toUpperCase() === CONFIRM_TEXT;

  return (
    <>
      <button
        className={`rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700 ${triggerClassName ?? ""}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        Eliminar
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">Confirmar eliminación de cooperativa</h3>
            <p className="mt-2 text-sm text-zinc-700">
              Vas a eliminar la cooperativa <strong>{cooperativeName}</strong>. Esta acción no se puede
              deshacer.
            </p>
            <p className="mt-3 text-xs text-zinc-600">
              Escribe <strong>{CONFIRM_TEXT}</strong> para confirmar.
            </p>

            <input
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              onChange={(event) => setConfirmValue(event.target.value)}
              placeholder={CONFIRM_TEXT}
              value={confirmValue}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
                onClick={() => {
                  setOpen(false);
                  setConfirmValue("");
                }}
                type="button"
              >
                Cancelar
              </button>

              <form action={deleteAction}>
                <button
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700 disabled:opacity-60"
                  disabled={!canConfirm}
                  type="submit"
                >
                  Confirmar eliminación
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
