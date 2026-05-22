import { NextRequest, NextResponse } from "next/server";

import { getAppBaseUrl, getNeonAuthApiBaseUrl } from "@/lib/auth/neon-auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/admin";
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

function readSetCookieHeaders(response: Response): string[] {
  const headersWithGetSetCookie = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }

  const merged = response.headers.get("set-cookie");
  return merged ? [merged] : [];
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  const safeNext = nextPath.startsWith("/") ? nextPath : "/admin";
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", safeNext);

  if (!email || !password) {
    loginUrl.searchParams.set("error", "missing_credentials");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const neonAuthApiBaseUrl = getNeonAuthApiBaseUrl();
  if (!neonAuthApiBaseUrl) {
    loginUrl.searchParams.set("error", "missing_auth_config");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const callbackURL = `${getAppBaseUrl()}${safeNext}`;

  let authResponse: Response;

  try {
    authResponse = await fetch(`${neonAuthApiBaseUrl}/sign-in/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: getAppBaseUrl(),
      },
      body: JSON.stringify({
        email,
        password,
        callbackURL,
      }),
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    loginUrl.searchParams.set("error", "auth_unavailable");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  if (!authResponse.ok) {
    loginUrl.searchParams.set("error", "invalid_credentials");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  type SignInPayload = {
    user?: {
      email?: string;
    };
  };

  let signedUserEmail = email;

  try {
    const payload = (await authResponse.clone().json()) as SignInPayload;
    if (payload.user?.email) {
      signedUserEmail = payload.user.email.toLowerCase();
    }
  } catch {
    // Keep fallback email from form when body is not JSON.
  }

  const localUser = await db.user.findUnique({
    where: { email: signedUserEmail },
    select: { id: true, isActive: true },
  });

  if (!localUser || !localUser.isActive) {
    loginUrl.searchParams.set("error", "not_provisioned");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const destination = new URL(safeNext, request.url);
  const response = NextResponse.redirect(destination, { status: 303 });

  const setCookieHeaders = readSetCookieHeaders(authResponse);
  for (const cookieValue of setCookieHeaders) {
    response.headers.append("set-cookie", cookieValue);
  }

  return response;
}