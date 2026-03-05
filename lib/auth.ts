import {
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isSafeRedirectPath,
  verifySessionToken,
} from "@/lib/session";

export {
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isSafeRedirectPath,
  verifySessionToken,
};

export async function verifyPassword(input: string, hash: string): Promise<boolean> {
  if (!input || !hash) {
    return false;
  }

  const bcrypt = await import("bcrypt");
  return bcrypt.compare(input, hash);
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    return originUrl.protocol === requestUrl.protocol && originUrl.host === requestUrl.host;
  } catch {
    return false;
  }
}
