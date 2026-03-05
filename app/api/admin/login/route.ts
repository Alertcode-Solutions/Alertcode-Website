import { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isSafeRedirectPath,
  isSameOriginRequest,
  verifyPassword,
} from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { error, success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { runtimeConfig } from "@/lib/config";
import { trackEvent } from "@/lib/observability";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

type LoginBody = {
  username?: unknown;
  password?: unknown;
  next?: unknown;
};

function parseBody(payload: unknown): { username: string; password: string; nextPath: string } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const body = payload as LoginBody;
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const nextPath = isSafeRedirectPath(body.next);

  if (!username || !password) {
    return null;
  }

  return { username, password, nextPath };
}

export const POST = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("adminLogin", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = parseBody(payload);

    if (!parsed) {
      return validationError("Username and password are required.");
    }

    const configuredUsername = process.env.ADMIN_USERNAME?.trim();
    const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const sessionSecret = process.env.SESSION_SECRET?.trim();

    if (!configuredUsername || !configuredPasswordHash || !sessionSecret) {
      return error("Admin authentication is not configured.", 500);
    }

    if (parsed.username !== configuredUsername) {
      return error("Invalid username or password.", 401);
    }

    const passwordValid = await verifyPassword(parsed.password, configuredPasswordHash);

    if (!passwordValid) {
      return error("Invalid username or password.", 401);
    }

    const sessionToken = await createSessionToken({ username: configuredUsername }, sessionSecret);

    trackEvent("admin_action", {
      action: "login",
      route: "/api/admin/login",
      timestamp: new Date().toISOString(),
      environment: runtimeConfig.appEnv,
    });

    await logAdminAction("admin_login", {
      username: configuredUsername,
      route: "/api/admin/login",
      timestamp: new Date().toISOString(),
      environment: runtimeConfig.appEnv,
    });

    const response = success(
      {
        redirectTo: parsed.nextPath,
      },
      200,
    );

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  },
  {
    noStore: true,
    fallbackMessage: "Unable to process admin login.",
  },
);

