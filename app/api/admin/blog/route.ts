import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE_NAME, isSameOriginRequest, verifySessionToken } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { error, success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { createPost, getAllPosts, type BlogPostInput } from "@/lib/blog";
import { runtimeConfig } from "@/lib/config";
import { sendBlogPublishedNotification } from "@/lib/email";
import { trackEvent } from "@/lib/observability";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

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

function parseBlogPostPayload(payload: unknown): { valid: true; data: BlogPostInput } | { valid: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid blog post payload." };
  }

  const input = payload as Record<string, unknown>;

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const date = typeof input.date === "string" ? input.date.trim() : "";
  const author = typeof input.author === "string" ? input.author.trim() : "";
  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";

  if (!title || !description || !date || !author || !slug || !content) {
    return { valid: false, message: "All fields are required." };
  }

  return {
    valid: true,
    data: {
      title,
      description,
      date,
      author,
      slug,
      content,
    },
  };
}

function revalidateBlogRoutes(slug: string): void {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
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

    const data = await getAllPosts();
    return success(data);
  },
  {
    noStore: true,
    fallbackMessage: "Unable to fetch blog posts.",
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

    const parsed = parseBlogPostPayload(payload);

    if (!parsed.valid) {
      return validationError(parsed.message);
    }

    try {
      const created = await createPost(parsed.data);

      await sendBlogPublishedNotification({
        title: created.title,
        slug: created.slug,
        author: created.author,
        date: created.date,
      });

      trackEvent("admin_action", {
        action: "create_blog_post",
        route: "/api/admin/blog",
        timestamp: new Date().toISOString(),
        environment: runtimeConfig.appEnv,
      });

      await logAdminAction("blog_create", {
        slug: created.slug,
        title: created.title,
      });

      revalidateBlogRoutes(created.slug);
      return success(created, 201);
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        if (errorValue.message.includes("already exists")) {
          return error(errorValue.message, 409);
        }

        return validationError(errorValue.message);
      }

      return error("Unable to create blog post.", 500);
    }
  },
  {
    noStore: true,
    fallbackMessage: "Unable to create blog post.",
  },
);

