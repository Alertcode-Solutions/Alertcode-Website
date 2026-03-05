import { NextRequest, NextResponse } from "next/server";
import { logInfo } from "@/lib/logger";
import { ADMIN_SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const UNPROTECTED_ADMIN_API_PATHS = new Set(["/api/admin/login", "/api/admin/logout"]);

function setNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function shouldLogRequests(): boolean {
  return (process.env.NEXT_PUBLIC_APP_ENV ?? "development").trim().toLowerCase() !== "production";
}

function logRequest(request: NextRequest, startedAt: number, statusCode: number): void {
  if (!shouldLogRequests()) {
    return;
  }

  logInfo("middleware.request", {
    path: request.nextUrl.pathname,
    method: request.method,
    statusCode,
    timestamp: new Date().toISOString(),
    responseTimeMs: Number((performance.now() - startedAt).toFixed(2)),
  });
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!token || !sessionSecret) {
    return false;
  }

  const payload = await verifySessionToken(token, sessionSecret);
  return Boolean(payload);
}

export async function middleware(request: NextRequest) {
  const startedAt = performance.now();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (UNPROTECTED_ADMIN_API_PATHS.has(pathname)) {
      const response = setNoStoreHeaders(NextResponse.next());
      logRequest(request, startedAt, response.status);
      return response;
    }

    if (!(await hasValidSession(request))) {
      const response = setNoStoreHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required.",
            },
          },
          { status: 401 },
        ),
      );

      logRequest(request, startedAt, response.status);
      return response;
    }

    const response = setNoStoreHeaders(NextResponse.next());
    logRequest(request, startedAt, response.status);
    return response;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!(await hasValidSession(request))) {
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = setNoStoreHeaders(NextResponse.redirect(loginUrl));
      logRequest(request, startedAt, response.status);
      return response;
    }

    const response = setNoStoreHeaders(NextResponse.next());
    logRequest(request, startedAt, response.status);
    return response;
  }

  const response = NextResponse.next();
  logRequest(request, startedAt, response.status);
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
