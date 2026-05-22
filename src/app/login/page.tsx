import Link from "next/link";
import { redirect } from "next/navigation";

import { getNeonAuthBaseUrl } from "@/lib/auth/neon-auth";
import { getAuthContext } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const context = await getAuthContext();

  if (context) {
    redirect(context.role === "PLATFORM_ADMIN" ? "/admin" : "/cooperativa");
  }

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/admin";
  const hasNeonAuthConfig = Boolean(getNeonAuthBaseUrl());

  const errorMessage =
    params.error === "invalid_credentials"
      ? "Credenciales inválidas."
      : params.error === "missing_auth_config"
        ? "Falta configurar NEON_AUTH_BASE_URL."
        : params.error === "auth_origin_mismatch"
          ? "El origen del despliegue no está autorizado en Neon Auth. Revisa Trusted Origins."
          : params.error === "auth_rejected"
            ? "Neon Auth rechazó la solicitud. Revisa configuración de entorno en Vercel."
        : params.error === "auth_unavailable"
          ? "No fue posible contactar Neon Auth en este momento."
          : params.error === "missing_credentials"
            ? "Debes ingresar correo y contraseña."
          : params.error === "not_provisioned"
            ? "Tu usuario existe en Neon Auth, pero no está habilitado en la base local del directorio."
            : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
      <section className="w-full rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Acceso administrativo</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Inicia sesión con Neon Auth para acceder al panel de administración.
        </p>

        {hasNeonAuthConfig ? (
          <form action="/auth/login" className="mt-6 grid gap-3" method="post">
            <input name="next" type="hidden" value={nextPath} />

            <label className="grid gap-1 text-sm">
              <span>Correo</span>
              <input
                className="rounded-md border border-zinc-300 px-3 py-2"
                name="email"
                required
                type="email"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span>Contraseña</span>
              <input
                className="rounded-md border border-zinc-300 px-3 py-2"
                name="password"
                required
                type="password"
              />
            </label>

            <button
              className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              type="submit"
            >
              Iniciar sesión
            </button>

            {errorMessage ? (
              <p className="text-sm text-rose-700">{errorMessage}</p>
            ) : null}
          </form>
        ) : (
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Falta configurar NEON_AUTH_BASE_URL en variables de entorno.
          </p>
        )}

        <p className="mt-4 text-sm">
          <Link className="text-zinc-700 underline" href="/">
            Volver al inicio
          </Link>
        </p>
      </section>
    </div>
  );
}