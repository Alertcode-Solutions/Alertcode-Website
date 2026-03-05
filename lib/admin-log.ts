import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

type AdminLogMetadata = Record<string, unknown>;

export type AdminLogEntry = {
  id: string;
  action: string;
  metadata: string;
  createdAt: Date;
};

export async function logAdminAction(action: string, metadata: AdminLogMetadata = {}): Promise<void> {
  const normalizedAction = action.trim();

  if (!normalizedAction) {
    return;
  }

  try {
    await db.adminLog.create({
      data: {
        action: normalizedAction,
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (error) {
    logError("admin.log.write_failed", {
      action: normalizedAction,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAdminLogs(): Promise<AdminLogEntry[]> {
  return db.adminLog.findMany({
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 300,
  });
}

