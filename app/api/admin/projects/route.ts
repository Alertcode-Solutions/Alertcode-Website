import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, isSameOriginRequest, verifySessionToken } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { error, success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { runtimeConfig } from "@/lib/config";
import { sendProjectCreatedNotification } from "@/lib/email";
import { trackEvent } from "@/lib/observability";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type ProjectInput,
} from "@/lib/projects";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!token || !sessionSecret) {
    return false;
  }

  const payload = await verifySessionToken(token, sessionSecret);
  return Boolean(payload);
}

function applyAdminApiRateLimit(request: NextRequest) {
  const clientIp = getClientIp(request);
  return consumeRateLimitByScope("adminApi", clientIp);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseCreatePayload(payload: unknown): { valid: true; data: ProjectInput } | { valid: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid project payload." };
  }

  const input = payload as Record<string, unknown>;

  if (!isNonEmptyString(input.title)) {
    return { valid: false, message: "Project title is required." };
  }

  if (!isNonEmptyString(input.slug)) {
    return { valid: false, message: "Project slug is required." };
  }

  if (!isNonEmptyString(input.industry)) {
    return { valid: false, message: "Project industry is required." };
  }

  if (!isNonEmptyString(input.description)) {
    return { valid: false, message: "Project description is required." };
  }

  if (!isNonEmptyString(input.problem)) {
    return { valid: false, message: "Project problem statement is required." };
  }

  if (!isNonEmptyString(input.solution)) {
    return { valid: false, message: "Project solution is required." };
  }

  if (!isNonEmptyString(input.features)) {
    return { valid: false, message: "Project key features are required." };
  }

  if (!isNonEmptyString(input.results)) {
    return { valid: false, message: "Project results are required." };
  }

  if (!isStringArray(input.technologies)) {
    return { valid: false, message: "Project technologies must be an array of strings." };
  }

  if (!isNonEmptyString(input.outcome)) {
    return { valid: false, message: "Project outcome is required." };
  }

  return {
    valid: true,
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      industry: input.industry.trim(),
      description: input.description.trim(),
      problem: input.problem.trim(),
      solution: input.solution.trim(),
      features: input.features.trim(),
      results: input.results.trim(),
      technologies: input.technologies.map((item) => item.trim()).filter(Boolean),
      outcome: input.outcome.trim(),
    },
  };
}

function handlePrismaError(errorValue: unknown, fallbackMessage: string) {
  if (errorValue instanceof Prisma.PrismaClientKnownRequestError && errorValue.code === "P2002") {
    return error("Project slug must be unique.", 409);
  }

  return error(fallbackMessage, 500);
}

export const GET = safeApiHandler(
  async (request: NextRequest) => {
    const rateLimit = applyAdminApiRateLimit(request);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!(await isAuthenticated(request))) {
      return error("Authentication required.", 401);
    }

    const data = await getProjects();
    return success(data);
  },
  {
    noStore: true,
    fallbackMessage: "Unable to fetch projects.",
  },
);

export const POST = safeApiHandler(
  async (request: NextRequest) => {
    const rateLimit = applyAdminApiRateLimit(request);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!(await isAuthenticated(request))) {
      return error("Authentication required.", 401);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return validationError("Request body must be valid JSON.");
    }

    const parsed = parseCreatePayload(payload);

    if (!parsed.valid) {
      return validationError(parsed.message);
    }

    try {
      const createdProject = await createProject(parsed.data);
      await sendProjectCreatedNotification({
        title: createdProject.title,
        slug: createdProject.slug,
        industry: createdProject.industry,
      });

      trackEvent("admin_action", {
        action: "create_project",
        route: "/api/admin/projects",
        timestamp: new Date().toISOString(),
        environment: runtimeConfig.appEnv,
      });

      await logAdminAction("project_create", {
        id: createdProject.id,
        title: createdProject.title,
        slug: createdProject.slug,
      });

      const data = await getProjects();
      return success(data, 201);
    } catch (errorValue) {
      return handlePrismaError(errorValue, "Unable to create project.");
    }
  },
  {
    noStore: true,
    fallbackMessage: "Unable to create project.",
  },
);

export const PUT = safeApiHandler(
  async (request: NextRequest) => {
    const rateLimit = applyAdminApiRateLimit(request);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!(await isAuthenticated(request))) {
      return error("Authentication required.", 401);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return validationError("Request body must be valid JSON.");
    }

    if (!payload || typeof payload !== "object") {
      return validationError("Invalid update payload.");
    }

    const input = payload as Record<string, unknown>;
    const id = isNonEmptyString(input.id) ? input.id.trim() : "";

    if (!id) {
      return validationError("Project id is required.");
    }

    try {
      const updated = await updateProject(id, {
        slug: isNonEmptyString(input.slug) ? input.slug.trim() : undefined,
        title: isNonEmptyString(input.title) ? input.title.trim() : undefined,
        industry: isNonEmptyString(input.industry) ? input.industry.trim() : undefined,
        description: isNonEmptyString(input.description) ? input.description.trim() : undefined,
        problem: isNonEmptyString(input.problem) ? input.problem.trim() : undefined,
        solution: isNonEmptyString(input.solution) ? input.solution.trim() : undefined,
        features: isNonEmptyString(input.features) ? input.features.trim() : undefined,
        results: isNonEmptyString(input.results) ? input.results.trim() : undefined,
        technologies: isStringArray(input.technologies)
          ? input.technologies.map((item) => item.trim()).filter(Boolean)
          : undefined,
        outcome: isNonEmptyString(input.outcome) ? input.outcome.trim() : undefined,
      });

      if (!updated) {
        return error("Project not found.", 404);
      }

      await logAdminAction("project_update", {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
      });

      const data = await getProjects();
      return success(data);
    } catch (errorValue) {
      return handlePrismaError(errorValue, "Unable to update project.");
    }
  },
  {
    noStore: true,
    fallbackMessage: "Unable to update project.",
  },
);

export const DELETE = safeApiHandler(
  async (request: NextRequest) => {
    const rateLimit = applyAdminApiRateLimit(request);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!(await isAuthenticated(request))) {
      return error("Authentication required.", 401);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    const id = request.nextUrl.searchParams.get("id")?.trim();

    if (!id) {
      return validationError("Project id is required.");
    }

    try {
      const removed = await deleteProject(id);

      if (!removed) {
        return error("Project not found.", 404);
      }

      trackEvent("admin_action", {
        action: "delete_project",
        route: "/api/admin/projects",
        timestamp: new Date().toISOString(),
        environment: runtimeConfig.appEnv,
      });

      await logAdminAction("project_delete", {
        id,
      });

      const data = await getProjects();
      return success(data);
    } catch (errorValue) {
      return handlePrismaError(errorValue, "Unable to delete project.");
    }
  },
  {
    noStore: true,
    fallbackMessage: "Unable to delete project.",
  },
);

