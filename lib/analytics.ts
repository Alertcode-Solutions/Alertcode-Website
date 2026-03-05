"use client";

export type AnalyticsEventPayload = {
  [key: string]: string | number | boolean | null | undefined;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function getGaId(): string {
  return process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
}

function shouldTrack(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() ?? "development";
  const gaId = getGaId();

  return appEnv === "production" && gaId.length > 0;
}

function sendToGtag(command: string, eventName: string, payload?: AnalyticsEventPayload): void {
  if (!shouldTrack() || typeof window.gtag !== "function") {
    return;
  }

  window.gtag(command, eventName, payload ?? {});
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sendToGtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(eventName: string, payload?: AnalyticsEventPayload): void {
  sendToGtag("event", eventName, payload);
}
