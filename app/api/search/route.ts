import { NextRequest } from "next/server";
import { success } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";
import { getSearchIndex } from "@/lib/search";

export const dynamic = "force-dynamic";

export const GET = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("searchApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const index = await getSearchIndex();
    const response = success(index);
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  },
  {
    fallbackMessage: "Unable to build search index.",
  },
);
