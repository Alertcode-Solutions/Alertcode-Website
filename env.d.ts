declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_APP_ENV?: string;
    NEXT_PUBLIC_ANALYTICS_ID?: string;
    NEXT_PUBLIC_GA_ID?: string;
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
    NEXT_PUBLIC_ENABLE_ERROR_TRACKING?: string;
    NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING?: string;
    NEXT_PUBLIC_LINKEDIN_URL?: string;
    NEXT_PUBLIC_X_URL?: string;
    NEXT_PUBLIC_GITHUB_URL?: string;
    CONTACT_EMAIL?: string;
    RESEND_API_KEY?: string;
    API_BASE_URL?: string;
    DATABASE_URL?: string;
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD_HASH?: string;
    SESSION_SECRET?: string;
    ENABLE_DEBUG_ENDPOINT?: string;
    LOG_LEVEL?: "info" | "warn" | "error";
    VERCEL?: string;
  }
}

declare module "bcrypt" {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
}
