import { NextRequest } from "next/server";
import { success } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { runtimeConfig } from "@/lib/config";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";
import packageJson from "@/package.json";

function formatMemoryUsageBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const dynamic = "force-dynamic";

export const GET = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("publicApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    return success(
      {
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: formatMemoryUsageBytes(process.memoryUsage().rss),
        environment: runtimeConfig.appEnv,
        version: packageJson.version,
        status: "healthy",
      },
      200,
    );
  },
  {
    noStore: true,
    fallbackMessage: "Unable to collect metrics.",
  },
);
