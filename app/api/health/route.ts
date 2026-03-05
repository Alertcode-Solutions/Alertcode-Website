import { NextRequest } from "next/server";
import { error, success } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export const GET = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("publicApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    try {
      await db.$queryRawUnsafe("SELECT 1");

      return success(
        {
          status: "ok",
          database: "connected",
          uptime: Math.floor(process.uptime()),
        },
        200,
      );
    } catch (errorValue) {
      logError("api.health.database_unavailable", {
        message: errorValue instanceof Error ? errorValue.message : "Unknown error",
      });

      return error("Database is unavailable.", 503);
    }
  },
  {
    noStore: true,
    fallbackMessage: "Health check failed.",
  },
);
