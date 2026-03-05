import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("config", () => {
  it("loads siteConfig defaults", async () => {
    const { siteConfig } = await import("@/lib/config");

    expect(siteConfig.name).toBe("Alertcode");
    expect(siteConfig.description.length).toBeGreaterThan(0);
    expect(siteConfig.url).toBe("https://example.com");
  });

  it("applies environment fallbacks when variables are missing", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_ENV;
    delete process.env.NEXT_PUBLIC_ANALYTICS_ID;
    delete process.env.API_BASE_URL;

    const { featureFlags, runtimeConfig, siteConfig } = await import("@/lib/config");

    expect(siteConfig.url).toBe("https://example.com");
    expect(runtimeConfig.appEnv).toBe("development");
    expect(runtimeConfig.apiBaseUrl).toBe("https://example.com");
    expect(featureFlags.enableAnalytics).toBe(false);
  });
});
