import { NextRequest, NextResponse } from "next/server";

import { getAppBaseUrl, getNeonAuthApiBaseUrl } from "@/lib/auth/neon-auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });

  const neonAuthApiBaseUrl = getNeonAuthApiBaseUrl();
  if (neonAuthApiBaseUrl) {
    try {
      await fetch(`${neonAuthApiBaseUrl}/sign-out`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: getAppBaseUrl(),
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({
          callbackURL: `${getAppBaseUrl()}/login`,
        }),
        cache: "no-store",
      });
    } catch {
      // Local cookie cleanup still proceeds even if remote sign-out fails.
    }
  }

  const possibleCookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth.csrf_token",
    "__Secure-better-auth.csrf_token",
    "neon-auth.session_token",
    "__Secure-neon-auth.session_token",
    "neon-auth.csrf_token",
    "__Secure-neon-auth.csrf_token",
  ];

  for (const cookieName of possibleCookieNames) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}