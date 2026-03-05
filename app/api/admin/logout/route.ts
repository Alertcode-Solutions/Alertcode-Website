import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, isSameOriginRequest } from "@/lib/auth";
import { error } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export const POST = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("adminApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    const response = NextResponse.redirect(new URL("/admin-login", request.url));
    clearSessionCookie(response);
    return response;
  },
  {
    noStore: true,
    fallbackMessage: "Unable to process logout.",
  },
);
