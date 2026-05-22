import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/admin", "/cooperativa"];

function hasLikelyNeonSessionCookie(request: NextRequest): boolean {
  const names = request.cookies.getAll().map((item) => item.name);

  return names.some(
    (name) =>
      name === "better-auth.session_token" ||
      name === "__Secure-better-auth.session_token" ||
      name === "neon-auth.session_token" ||
      name === "__Secure-neon-auth.session_token" ||
      (name.includes("better-auth") && name.includes("session"))
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const bypassEnabled = process.env.ADMIN_DEV_BYPASS === "true";
  if (bypassEnabled) {
    return NextResponse.next();
  }

  if (hasLikelyNeonSessionCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/cooperativa/:path*"],
};
