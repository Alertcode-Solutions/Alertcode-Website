import { NextRequest } from "next/server";
import { success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { createInquiry } from "@/lib/inquiries";
import { sendInquiryNotification } from "@/lib/email";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUDGET_OPTIONS = new Set(["Under $5k", "$5k - $20k", "$20k - $50k", "$50k+"]);
const TIMELINE_OPTIONS = new Set(["1 month", "1-3 months", "3-6 months", "Flexible"]);

type InquiryPayload = {
  name: string;
  email: string;
  company?: string;
  project: string;
  budget?: string;
  timeline?: string;
};

type ParseResult =
  | {
      valid: true;
      spam: boolean;
      data: InquiryPayload;
    }
  | {
      valid: false;
      message: string;
    };

function parsePayload(payload: unknown): ParseResult {
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid inquiry payload." };
  }

  const input = payload as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const company = typeof input.company === "string" ? input.company.trim() : "";
  const project = typeof input.project === "string" ? input.project.trim() : "";
  const budget = typeof input.budget === "string" ? input.budget.trim() : "";
  const timeline = typeof input.timeline === "string" ? input.timeline.trim() : "";
  const honeypot = typeof input.website === "string" ? input.website.trim() : "";

  if (honeypot.length > 0) {
    return {
      valid: true,
      spam: true,
      data: {
        name,
        email,
        company,
        project,
        budget,
        timeline,
      },
    };
  }

  if (!name) {
    return { valid: false, message: "Name is required." };
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { valid: false, message: "Valid email is required." };
  }

  if (!project) {
    return { valid: false, message: "Project description is required." };
  }

  if (budget && !BUDGET_OPTIONS.has(budget)) {
    return { valid: false, message: "Invalid budget selection." };
  }

  if (timeline && !TIMELINE_OPTIONS.has(timeline)) {
    return { valid: false, message: "Invalid timeline selection." };
  }

  return {
    valid: true,
    spam: false,
    data: {
      name,
      email,
      company,
      project,
      budget,
      timeline,
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

    const parsed = parsePayload(payload);

    if (!parsed.valid) {
      return validationError(parsed.message);
    }

    if (parsed.spam) {
      return success(
        {
          message: "Inquiry submitted successfully.",
        },
        201,
      );
    }

    const created = await createInquiry(parsed.data);

    await sendInquiryNotification({
      name: created.name,
      email: created.email,
      company: created.company ?? undefined,
      project: created.project,
      budget: created.budget ?? undefined,
      timeline: created.timeline ?? undefined,
    });

    return success(
      {
        message: "Inquiry submitted successfully.",
      },
      201,
    );
  },
  {
    noStore: true,
    fallbackMessage: "Unable to submit inquiry right now.",
  },
);

