import "server-only";

import { cookies } from "next/headers";

type NeonSessionResponse = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
};

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getDatabaseNameFromDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    return "neondb";
  }

  try {
    const parsed = new URL(databaseUrl);
    const dbName = parsed.pathname.replace(/^\//, "").trim();
    return dbName || "neondb";
  } catch {
    return "neondb";
  }
}

export function getNeonAuthBaseUrl(): string | null {
  const configured = process.env.NEON_AUTH_BASE_URL?.trim();

  if (!configured) {
    return null;
  }

  try {
    const parsed = new URL(configured);
    // Always use origin to avoid malformed values like /neondb/auth.
    return trimTrailingSlash(parsed.origin);
  } catch {
    return null;
  }
}

export function getNeonAuthApiBaseUrl(): string | null {
  const origin = getNeonAuthBaseUrl();
  if (!origin) {
    return null;
  }

  return `${origin}/${getDatabaseNameFromDatabaseUrl()}/auth`;
}

export function getAppBaseUrl(): string {
  const configured = process.env.APP_BASE_URL?.trim();

  if (!configured) {
    return "http://localhost:3000";
  }

  return trimTrailingSlash(configured);
}

export async function getNeonSessionFromCookie(): Promise<NeonSessionResponse | null> {
  const neonAuthApiBaseUrl = getNeonAuthApiBaseUrl();
  if (!neonAuthApiBaseUrl) {
    return null;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  const endpoints = [`${neonAuthApiBaseUrl}/get-session`];

  try {
    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as NeonSessionResponse;
      if (!payload.user?.email) {
        continue;
      }

      return payload;
    }

    return null;
  } catch {
    return null;
  }
}

export function buildSignInUrl(nextPath: string): string | null {
  const neonAuthApiBaseUrl = getNeonAuthApiBaseUrl();
  if (!neonAuthApiBaseUrl) {
    return null;
  }

  const safeNext = nextPath.startsWith("/") ? nextPath : "/admin";
  const callbackURL = `${getAppBaseUrl()}${safeNext}`;

  return `${neonAuthApiBaseUrl}/sign-in/email?callbackURL=${encodeURIComponent(callbackURL)}`;
}

export function buildSignOutUrl(): string | null {
  const neonAuthApiBaseUrl = getNeonAuthApiBaseUrl();
  if (!neonAuthApiBaseUrl) {
    return null;
  }

  const callbackURL = `${getAppBaseUrl()}/login`;
  return `${neonAuthApiBaseUrl}/sign-out?callbackURL=${encodeURIComponent(callbackURL)}`;
}