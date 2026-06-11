import Image from "next/image";
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
      : params.error === "invalid_callbackurl"
        ? "Neon Auth rechazó la callback URL. Agrega https://cooperatvaspr.vercel.app en Trusted Origins."
        : params.error === "invalid_origin"
          ? "Neon Auth rechazó el origin del request. Verifica Trusted Origins en Neon."
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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: `linear-gradient(135deg, var(--verde-impulso) 0%, #00482e 100%)` }}
    >
      <section className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Image
              src="/brand/logo-mark.svg"
              alt="cooperativas.pr"
              width={88}
              height={48}
              priority
            />
          </div>
          <Image
            src="/brand/logo-verde.svg"
            alt="cooperativas.pr"
            width={272}
            height={28}
            className="mb-1"
          />
          <p className="text-white/60 text-sm mt-1">Acceso administrativo</p>
        </div>

        <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-2xl">
          <h1 className="text-lg font-bold mb-1" style={{ color: "var(--verde-impulso)" }}>
            Iniciar sesión
          </h1>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            Accede al panel de tu cooperativa o administración.
          </p>

          {hasNeonAuthConfig ? (
            <form action="/auth/login" className="flex flex-col gap-4" method="post">
              <input name="next" type="hidden" value={nextPath} />

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Correo electrónico
                </label>
                <input
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                  style={{ borderColor: "var(--border-subtle)" }}
                  name="email"
                  required
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Contraseña
                </label>
                <input
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                  style={{ borderColor: "var(--border-subtle)" }}
                  name="password"
                  required
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 mt-1"
                style={{ backgroundColor: "var(--verde-impulso)", color: "#fff" }}
                type="submit"
              >
                Entrar
              </button>

              {errorMessage ? (
                <p className="text-xs text-rose-700 text-center">{errorMessage}</p>
              ) : null}
            </form>
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Falta configurar <code className="font-mono text-xs">NEON_AUTH_BASE_URL</code> en variables de entorno.
            </p>
          )}

          <p className="mt-5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            <Link className="hover:underline" style={{ color: "var(--azul-compromiso)" }} href="/">
              ← Volver al directorio
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}