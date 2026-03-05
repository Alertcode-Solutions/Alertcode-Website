type SessionTokenPayload = {
  username: string;
  iat: number;
  exp: number;
};

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (base64.length % 4)) % 4;
  return `${base64}${"=".repeat(paddingLength)}`;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return toBase64Url(btoa(binary));
}

function base64UrlToBytes(base64Url: string): Uint8Array | null {
  try {
    const binary = atob(fromBase64Url(base64Url));
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch {
    return null;
  }
}

function encodeString(value: string): string {
  return bytesToBase64Url(encoder.encode(value));
}

function decodeString(value: string): string | null {
  const bytes = base64UrlToBytes(value);

  if (!bytes) {
    return null;
  }

  return decoder.decode(bytes);
}

function secureCompare(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return bytesToBase64Url(new Uint8Array(signature));
}

function isSessionPayload(value: unknown): value is SessionTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<SessionTokenPayload>;

  return (
    typeof payload.username === "string" &&
    payload.username.length > 0 &&
    typeof payload.iat === "number" &&
    Number.isFinite(payload.iat) &&
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp)
  );
}

export async function createSessionToken(
  payload: { username: string; iat?: number; exp?: number },
  secret: string,
): Promise<string> {
  const normalizedSecret = secret.trim();

  if (!payload.username || !normalizedSecret) {
    throw new Error("Cannot create session token without username and secret.");
  }

  const now = Math.floor(Date.now() / 1000);
  const sessionPayload: SessionTokenPayload = {
    username: payload.username,
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = encodeString(JSON.stringify(sessionPayload));
  const signature = await signValue(encodedPayload, normalizedSecret);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionTokenPayload | null> {
  const normalizedSecret = secret.trim();

  if (!token || !normalizedSecret) {
    return null;
  }

  const tokenParts = token.split(".");

  if (tokenParts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = tokenParts;
  const expectedSignature = await signValue(encodedPayload, normalizedSecret);

  if (!secureCompare(signature, expectedSignature)) {
    return null;
  }

  const decodedPayload = decodeString(encodedPayload);

  if (!decodedPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodedPayload) as unknown;

    if (!isSessionPayload(parsed)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (parsed.exp <= now) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isSafeRedirectPath(pathname: unknown): string {
  if (typeof pathname !== "string") {
    return "/admin";
  }

  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/admin";
  }

  return pathname;
}
