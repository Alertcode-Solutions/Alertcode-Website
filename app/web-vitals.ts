import { trackEvent } from "@/lib/observability";

export type WebVitalMetric = {
  id: string;
  name: "CLS" | "FID" | "LCP" | "TTFB" | string;
  label: "web-vital" | "custom";
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number;
  navigationType?: string;
};

const SUPPORTED_VITALS = new Set(["CLS", "FID", "LCP", "TTFB"]);

export function reportWebVitals(metric: WebVitalMetric): void {
  if (!SUPPORTED_VITALS.has(metric.name)) {
    return;
  }

  trackEvent("web_vital", {
    metricId: metric.id,
    metricName: metric.name,
    label: metric.label,
    value: Number(metric.value.toFixed(2)),
    rating: metric.rating,
    delta: metric.delta ? Number(metric.delta.toFixed(2)) : undefined,
    navigationType: metric.navigationType,
  });
}
