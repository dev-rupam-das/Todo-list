import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "./lib/auth-config";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/auth/login"];

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

async function readSession(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const secret = getJwtSecret();

  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((path) => pathname === path);
}

function isPublicApiPath(pathname) {
  return PUBLIC_API_PATHS.some((path) => pathname === path);
}

function buildDashboardPath(payload) {
  return payload?.role === "admin" ? "/admin/dashboard" : "/dashboard";
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = await readSession(request);
  const isApiRoute = pathname.startsWith("/api");

  if (isPublicPath(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL(buildDashboardPath(session), request.url));
    }

    return NextResponse.next();
  }

  if (isApiRoute && isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "403 Access Denied" },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
