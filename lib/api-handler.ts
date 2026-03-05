import { NextRequest, NextResponse } from "next/server";
import { error as errorResponse } from "@/lib/api-response";
import { logError } from "@/lib/logger";
import { trackApiLatency } from "@/lib/observability";

type ApiHandler = (request: NextRequest) => Promise<Response> | Response;

type SafeApiHandlerOptions = {
  noStore?: boolean;
  fallbackStatus?: number;
  fallbackMessage?: string;
};

function setNoStoreHeaders(response: Response): void {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}

function reportLatency(request: NextRequest, startedAt: number, statusCode: number): void {
  const durationMs = performance.now() - startedAt;
  const route = new URL(request.url).pathname;

  trackApiLatency(route, request.method, durationMs, statusCode);
}

export function safeApiHandler(
  handler: ApiHandler,
  {
    noStore = false,
    fallbackStatus = 500,
    fallbackMessage = "An unexpected server error occurred.",
  }: SafeApiHandlerOptions = {},
) {
  return async (request: NextRequest): Promise<Response> => {
    const startedAt = performance.now();

    try {
      const response = await handler(request);

      if (noStore) {
        setNoStoreHeaders(response);
      }

      reportLatency(request, startedAt, response.status);
      return response;
    } catch (error) {
      logError("api.unhandled_error", {
        path: new URL(request.url).pathname,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      const response = errorResponse(fallbackMessage, fallbackStatus);

      if (noStore) {
        setNoStoreHeaders(response);
      }

      reportLatency(request, startedAt, response.status);
      return response;
    }
  };
}

export function createRateLimitResponse(retryAfterSeconds: number): NextResponse {
  const response = errorResponse("Too many requests. Please try again shortly.", 429);
  response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}
