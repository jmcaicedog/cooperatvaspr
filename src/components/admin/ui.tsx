import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type AdminCardProps = ComponentPropsWithoutRef<"section">;

export function AdminCard({ className, ...props }: AdminCardProps) {
  return <section className={cx("admin-card rounded-xl border bg-white", className)} {...props} />;
}

type AdminButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger";
};

export function AdminButton({
  className,
  variant = "primary",
  type = "button",
  ...props
}: AdminButtonProps) {
  const variantClass =
    variant === "primary"
      ? "admin-btn-primary"
      : variant === "secondary"
        ? "admin-btn-secondary"
        : "border border-red-200 bg-white text-red-600 hover:bg-red-50";

  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        className
      )}
      type={type}
      {...props}
    />
  );
}

type AdminLabelProps = ComponentPropsWithoutRef<"label">;

export function AdminLabel({ className, ...props }: AdminLabelProps) {
  return <label className={cx("mb-1 block text-sm font-medium text-zinc-700", className)} {...props} />;
}

export const AdminInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function AdminInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cx(
          "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900",
          className
        )}
        {...props}
      />
    );
  }
);

export const AdminSelect = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(
  function AdminSelect({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cx(
          "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900",
          className
        )}
        {...props}
      />
    );
  }
);

export const AdminTextarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(function AdminTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx(
        "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900",
        className
      )}
      {...props}
    />
  );
});
