import "server-only";

import { getAppBaseUrl, getNeonAuthApiBaseUrl } from "@/lib/auth/neon-auth";
import { db } from "@/lib/db";

export type NeonProvisionResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

type NeonAdminResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export async function deleteNeonAuthUserByEmail(email: string): Promise<NeonAdminResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Correo inválido para eliminar en Neon Auth.",
    };
  }

  try {
    await db.$executeRaw`
      DELETE FROM neon_auth."user"
      WHERE lower(email) = lower(${normalizedEmail})
    `;

    return { ok: true };
  } catch {
    return {
      ok: false,
      code: "neon_auth_delete_error",
      message: "No fue posible eliminar el usuario en el esquema neon_auth.",
    };
  }
}

export async function createNeonAuthUser(params: {
  email: string;
  password: string;
  name: string;
}): Promise<NeonProvisionResult> {
  const neonAuthApiBaseUrl = getNeonAuthApiBaseUrl();

  if (!neonAuthApiBaseUrl) {
    return {
      ok: false,
      code: "missing_auth_config",
      message: "NEON_AUTH_BASE_URL no está configurado correctamente.",
    };
  }

  try {
    const response = await fetch(`${neonAuthApiBaseUrl}/sign-up/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: getAppBaseUrl(),
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        name: params.name,
        callbackURL: `${getAppBaseUrl()}/login`,
      }),
      cache: "no-store",
    });

    if (response.ok) {
      return { ok: true };
    }

    type ErrorPayload = {
      code?: string;
      message?: string;
    };

    const payload = (await response.json().catch(() => ({}))) as ErrorPayload;

    return {
      ok: false,
      code: payload.code ?? "neon_auth_error",
      message: payload.message ?? "No se pudo crear el usuario en Neon Auth.",
    };
  } catch {
    return {
      ok: false,
      code: "neon_auth_unavailable",
      message: "No fue posible contactar Neon Auth en este momento.",
    };
  }
}