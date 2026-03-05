import { featureFlags, runtimeConfig } from "@/lib/config";
import { logError, logInfo } from "@/lib/logger";

export type ObservabilityPayload = {
  [key: string]: string | number | boolean | null | undefined;
};

function shouldTrack(flagEnabled: boolean): boolean {
  if (runtimeConfig.appEnv !== "production") {
    return true;
  }

  return flagEnabled;
}

export function trackPageView(path: string): void {
  if (!shouldTrack(featureFlags.enableAnalytics)) {
    return;
  }

  logInfo("observability.page_view", {
    path,
    appEnv: runtimeConfig.appEnv,
    analyticsEnabled: featureFlags.enableAnalytics,
  });
}

export function trackEvent(eventName: string, payload?: ObservabilityPayload): void {
  if (!shouldTrack(featureFlags.enableAnalytics)) {
    return;
  }

  logInfo("observability.event", {
    eventName,
    appEnv: runtimeConfig.appEnv,
    analyticsEnabled: featureFlags.enableAnalytics,
    ...payload,
  });
}

// Structured error payload is intentionally tool-agnostic for future Sentry/Logtail/Datadog adapters.
export function trackError(name: string, payload?: ObservabilityPayload): void {
  if (!shouldTrack(featureFlags.enableErrorTracking)) {
    return;
  }

  const route = typeof payload?.route === "string" ? payload.route : "unknown";
  const timestamp = typeof payload?.timestamp === "string" ? payload.timestamp : new Date().toISOString();
  const message = typeof payload?.message === "string" ? payload.message : name;
  const stack = runtimeConfig.appEnv !== "production" ? payload?.stack : undefined;

  logError("observability.error", {
    name,
    message,
    route,
    timestamp,
    environment: runtimeConfig.appEnv,
    errorTrackingEnabled: featureFlags.enableErrorTracking,
    stack,
    ...payload,
  });
}

export function trackApiLatency(route: string, method: string, durationMs: number, statusCode: number): void {
  if (!shouldTrack(featureFlags.enablePerformanceTracking)) {
    return;
  }

  const roundedDuration = Number(durationMs.toFixed(2));

  logInfo("observability.api_latency", {
    route,
    method,
    durationMs: roundedDuration,
    statusCode,
    appEnv: runtimeConfig.appEnv,
    performanceTrackingEnabled: featureFlags.enablePerformanceTracking,
  });
}
