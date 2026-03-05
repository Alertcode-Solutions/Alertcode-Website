export type AppEnvironment = "development" | "staging" | "production";

type SiteConfig = {
  name: string;
  description: string;
  url: string;
  social: {
    linkedin: string;
    x: string;
    github: string;
  };
};

type FeatureFlags = {
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  enableDebugEndpoint: boolean;
  enableExperimentalFeatures: boolean;
};

const DEFAULT_SITE_URL = "https://example.com";
const DEFAULT_SITE_NAME = "Alertcode";
const DEFAULT_DESCRIPTION =
  "Alertcode designs AI systems, blockchain architectures, and scalable modern platforms.";

function readEnvString(value: string | undefined, fallback: string): string {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : fallback;
}

function readEnvBoolean(value: string | undefined, fallback = false): boolean {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "1") {
    return true;
  }

  if (normalizedValue === "false" || normalizedValue === "0") {
    return false;
  }

  return fallback;
}

function normalizeEnvironment(value: string | undefined): AppEnvironment {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === "production" || normalizedValue === "staging" || normalizedValue === "development") {
    return normalizedValue;
  }

  return "development";
}

function normalizeUrl(value: string | undefined, fallback: string): string {
  const candidate = readEnvString(value, fallback);

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function validateCriticalEnvironment(): void {
  if (typeof window !== "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const requiredVariables = ["DATABASE_URL", "SESSION_SECRET", "NEXT_PUBLIC_SITE_URL"] as const;
  const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missingVariables.join(", ")}`,
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  try {
    new URL(siteUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL in production.");
  }

  const appEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? "").trim().toLowerCase();
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

  if (appEnv === "production" && databaseUrl.toLowerCase().includes("staging")) {
    throw new Error("DATABASE_URL appears to reference staging while NEXT_PUBLIC_APP_ENV is production.");
  }
}

validateCriticalEnvironment();

const appEnv = normalizeEnvironment(process.env.NEXT_PUBLIC_APP_ENV);
const siteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);
const analyticsId = readEnvString(process.env.NEXT_PUBLIC_GA_ID, readEnvString(process.env.NEXT_PUBLIC_ANALYTICS_ID, ""));
const analyticsExplicitlyEnabled = readEnvBoolean(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, false);
const errorTrackingEnabled = readEnvBoolean(process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING, false);
const performanceTrackingEnabled = readEnvBoolean(process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING, false);
const debugEndpointEnabled = readEnvBoolean(process.env.ENABLE_DEBUG_ENDPOINT, false);
const isStaging = appEnv === "staging";

export const siteConfig: SiteConfig = {
  name: DEFAULT_SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  url: siteUrl,
  social: {
    linkedin: readEnvString(process.env.NEXT_PUBLIC_LINKEDIN_URL, ""),
    x: readEnvString(process.env.NEXT_PUBLIC_X_URL, ""),
    github: readEnvString(process.env.NEXT_PUBLIC_GITHUB_URL, ""),
  },
};

export const featureFlags: FeatureFlags = {
  enableAnalytics: isStaging || analyticsExplicitlyEnabled || analyticsId.length > 0,
  enableErrorTracking: isStaging || errorTrackingEnabled,
  enablePerformanceTracking: isStaging || performanceTrackingEnabled,
  enableDebugEndpoint: isStaging || debugEndpointEnabled,
  enableExperimentalFeatures: appEnv !== "production",
};

export const runtimeConfig = {
  appEnv,
  analyticsId,
  contactEmail: readEnvString(process.env.CONTACT_EMAIL, ""),
  apiBaseUrl: normalizeUrl(process.env.API_BASE_URL, siteUrl),
};

export function buildAbsoluteUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

