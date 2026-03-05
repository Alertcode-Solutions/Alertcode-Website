import { NextRequest } from "next/server";
import { error, success } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { featureFlags, runtimeConfig } from "@/lib/config";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function isDebugEndpointEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return featureFlags.enableDebugEndpoint;
}

export const GET = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("publicApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!isDebugEndpointEnabled()) {
      return error("Not found.", 404);
    }

    return success(
      {
        environment: runtimeConfig.appEnv,
        uptime: `${Math.floor(process.uptime())}s`,
        status: "ok",
      },
      200,
    );
  },
  {
    noStore: true,
    fallbackMessage: "Unable to collect debug diagnostics.",
  },
);
