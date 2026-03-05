import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { isSameOriginRequest } from "@/lib/auth";
import { error, success, validationError } from "@/lib/api-response";
import { createRateLimitResponse, safeApiHandler } from "@/lib/api-handler";
import { logAdminAction } from "@/lib/admin-log";
import { consumeRateLimitByScope, getClientIp } from "@/lib/rate-limit";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const ALLOWED_FOLDERS = new Set(["blog", "projects", "team"]);
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function normalizeFolder(value: string | null): string {
  const folder = (value ?? "blog").trim().toLowerCase();
  return ALLOWED_FOLDERS.has(folder) ? folder : "";
}

function extensionForMime(type: string): string {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function isSafeWithinUploads(filePath: string): boolean {
  const normalizedRoot = path.resolve(UPLOAD_ROOT);
  const normalizedPath = path.resolve(filePath);
  return normalizedPath.startsWith(normalizedRoot);
}

async function ensureUploadFolders(): Promise<void> {
  await Promise.all(
    Array.from(ALLOWED_FOLDERS).map((folder) => fs.mkdir(path.join(UPLOAD_ROOT, folder), { recursive: true })),
  );
}

type MediaItem = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  folder: string;
};

async function listMediaItems(): Promise<MediaItem[]> {
  await ensureUploadFolders();
  const folders = Array.from(ALLOWED_FOLDERS);

  const folderItems = await Promise.all(
    folders.map(async (folder) => {
      const folderPath = path.join(UPLOAD_ROOT, folder);
      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      const files = entries.filter((entry) => entry.isFile());

      const items = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folderPath, file.name);
          const stat = await fs.stat(filePath);

          return {
            name: file.name,
            url: `/uploads/${folder}/${file.name}`,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
            folder,
          } satisfies MediaItem;
        }),
      );

      return items;
    }),
  );

  return folderItems.flat().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export const GET = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("adminApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const items = await listMediaItems();
    return success(items);
  },
  {
    noStore: true,
    fallbackMessage: "Unable to fetch media files.",
  },
);

export const POST = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("adminApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    const form = await request.formData();
    const file = form.get("file");
    const folder = normalizeFolder(typeof form.get("folder") === "string" ? (form.get("folder") as string) : null);

    if (!folder) {
      return validationError("Invalid upload folder.");
    }

    if (!(file instanceof File)) {
      return validationError("Image file is required.");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return validationError("Only png, jpg, jpeg, and webp files are allowed.");
    }

    if (file.size > MAX_FILE_BYTES) {
      return validationError("File size must be 5MB or less.");
    }

    await ensureUploadFolders();

    const extension = extensionForMime(file.type);
    const fileName = `${Date.now()}-${randomUUID().replace(/-/g, "")}.${extension}`;
    const filePath = path.join(UPLOAD_ROOT, folder, fileName);

    if (!isSafeWithinUploads(filePath)) {
      return error("Invalid upload target.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${fileName}`;

    await logAdminAction("media_upload", {
      url,
      folder,
      size: file.size,
      mimeType: file.type,
    });

    return success({ url }, 201);
  },
  {
    noStore: true,
    fallbackMessage: "Unable to upload media.",
  },
);

export const DELETE = safeApiHandler(
  async (request: NextRequest) => {
    const clientIp = getClientIp(request);
    const rateLimit = consumeRateLimitByScope("adminApi", clientIp);

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfterSeconds);
    }

    if (!isSameOriginRequest(request)) {
      return error("Invalid request origin.", 403);
    }

    const fileUrl = request.nextUrl.searchParams.get("url")?.trim() ?? "";

    if (!fileUrl.startsWith("/uploads/")) {
      return validationError("Invalid file url.");
    }

    const relativePath = fileUrl.replace(/^\/uploads\//, "");
    const [folder, ...nameParts] = relativePath.split("/");

    if (!folder || !ALLOWED_FOLDERS.has(folder) || nameParts.length !== 1) {
      return validationError("Invalid file url.");
    }

    const fileName = nameParts[0];

    if (!fileName || fileName.includes("..") || fileName.includes("/")) {
      return validationError("Invalid file name.");
    }

    const filePath = path.join(UPLOAD_ROOT, folder, fileName);

    if (!isSafeWithinUploads(filePath)) {
      return validationError("Invalid file path.");
    }

    try {
      await fs.unlink(filePath);
    } catch {
      return error("File not found.", 404);
    }

    await logAdminAction("media_delete", {
      url: fileUrl,
      folder,
    });

    return success({ deleted: true });
  },
  {
    noStore: true,
    fallbackMessage: "Unable to delete media.",
  },
);

