import { NextRequest } from "next/server";
import { success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { subscribeEmail } from "@/lib/subscribers";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const input = payload as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }

  return email;
}

export const POST = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("publicApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return validationError("Request body must be valid JSON.");
    }

    const email = parseEmail(payload);

    if (!email) {
      return validationError("A valid email address is required.");
    }

    await subscribeEmail(email);

    return success(
      {
        message: "Subscribed successfully",
      },
      200,
    );
  },
  {
    noStore: true,
    fallbackMessage: "Unable to subscribe right now.",
  },
);

