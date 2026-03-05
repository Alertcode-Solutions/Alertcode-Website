import { NextRequest } from "next/server";
import { error, success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { runtimeConfig } from "@/lib/config";
import { sendContactNotification } from "@/lib/email";
import { logInfo, logWarn } from "@/lib/logger";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

type ContactPayload = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateContactPayload(payload: unknown): { isValid: true; data: ContactPayload } | { isValid: false } {
  if (!isObject(payload)) {
    return { isValid: false };
  }

  const name = payload.name;
  const email = payload.email;
  const projectType = payload.projectType;
  const message = payload.message;

  if (!isNonEmptyString(name)) {
    return { isValid: false };
  }

  if (!isNonEmptyString(email) || !EMAIL_PATTERN.test(email.trim())) {
    return { isValid: false };
  }

  if (!isNonEmptyString(projectType)) {
    return { isValid: false };
  }

  if (!isNonEmptyString(message)) {
    return { isValid: false };
  }

  return {
    isValid: true,
    data: {
      name: toTrimmedString(name),
      email: toTrimmedString(email),
      projectType: toTrimmedString(projectType),
      message: toTrimmedString(message),
    },
  };
}

export const POST = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("publicApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return validationError("Request body must be valid JSON.");
    }

    const validation = validateContactPayload(payload);

    if (!validation.isValid) {
      logWarn("api.contact.validation_failed", { route: "/api/contact" });
      return validationError("Invalid contact payload.");
    }

    if (!runtimeConfig.contactEmail) {
      logWarn("api.contact.contact_email_missing", { critical: true });
    }

    const emailSent = await sendContactNotification(validation.data);

    logInfo("api.contact.received", {
      projectType: validation.data.projectType,
      contactEmailConfigured: Boolean(runtimeConfig.contactEmail),
      notificationSent: emailSent,
    });

    return success(
      {
        message: "Contact request received successfully.",
        receivedAt: new Date().toISOString(),
      },
      200,
    );
  },
  {
    noStore: true,
    fallbackMessage: "Unable to process contact request.",
  },
);
