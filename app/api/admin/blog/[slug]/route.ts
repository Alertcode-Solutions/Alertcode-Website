import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE_NAME, isSameOriginRequest, verifySessionToken } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { error, success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { deletePostBySlug, getEditablePostBySlug, updatePostBySlug, type BlogPostInput } from "@/lib/blog";
import { runtimeConfig } from "@/lib/config";
import { trackEvent } from "@/lib/observability";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

type RouteContext = {
  params: {
    slug: string;
  };
};

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

function revalidateBlogRoutes(slug: string, previousSlug?: string): void {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
}

export function GET(request: NextRequest, context: RouteContext) {
  return safeApiHandler(
    async (req: NextRequest) => {
      const rateLimit = applyAdminApiRateLimit(req);

      if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.retryAfterSeconds);
      }

      if (!(await isAuthenticated(req))) {
        return error("Authentication required.", 401);
      }

      const post = await getEditablePostBySlug(context.params.slug);

      if (!post) {
        return error("Blog post not found.", 404);
      }

      return success(post);
    },
    {
      noStore: true,
      fallbackMessage: "Unable to fetch blog post.",
    },
  )(request);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return safeApiHandler(
    async (req: NextRequest) => {
      const rateLimit = applyAdminApiRateLimit(req);

      if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.retryAfterSeconds);
      }

      if (!(await isAuthenticated(req))) {
        return error("Authentication required.", 401);
      }

      if (!isSameOriginRequest(req)) {
        return error("Invalid request origin.", 403);
      }

      let payload: unknown;

      try {
        payload = await req.json();
      } catch {
        return validationError("Request body must be valid JSON.");
      }

      const parsed = parseBlogPostPayload(payload);

      if (!parsed.valid) {
        return validationError(parsed.message);
      }

      try {
        const updated = await updatePostBySlug(context.params.slug, parsed.data);

        if (!updated) {
          return error("Blog post not found.", 404);
        }

        trackEvent("admin_action", {
          action: "update_blog_post",
          route: `/api/admin/blog/${context.params.slug}`,
          timestamp: new Date().toISOString(),
          environment: runtimeConfig.appEnv,
        });

        await logAdminAction("blog_update", {
          previousSlug: context.params.slug,
          slug: updated.slug,
          title: updated.title,
        });

        revalidateBlogRoutes(updated.slug, context.params.slug);
        return success(updated);
      } catch (errorValue) {
        if (errorValue instanceof Error) {
          if (errorValue.message.includes("already exists")) {
            return error(errorValue.message, 409);
          }

          return validationError(errorValue.message);
        }

        return error("Unable to update blog post.", 500);
      }
    },
    {
      noStore: true,
      fallbackMessage: "Unable to update blog post.",
    },
  )(request);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return safeApiHandler(
    async (req: NextRequest) => {
      const rateLimit = applyAdminApiRateLimit(req);

      if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.retryAfterSeconds);
      }

      if (!(await isAuthenticated(req))) {
        return error("Authentication required.", 401);
      }

      if (!isSameOriginRequest(req)) {
        return error("Invalid request origin.", 403);
      }

      const removed = await deletePostBySlug(context.params.slug);

      if (!removed) {
        return error("Blog post not found.", 404);
      }

      trackEvent("admin_action", {
        action: "delete_blog_post",
        route: `/api/admin/blog/${context.params.slug}`,
        timestamp: new Date().toISOString(),
        environment: runtimeConfig.appEnv,
      });

      await logAdminAction("blog_delete", {
        slug: context.params.slug,
      });

      revalidateBlogRoutes(context.params.slug);
      return success({ deleted: true });
    },
    {
      noStore: true,
      fallbackMessage: "Unable to delete blog post.",
    },
  )(request);
}

