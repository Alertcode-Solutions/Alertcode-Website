import { Prisma, PrismaClient } from "@prisma/client";
import { logError, logInfo, logWarn } from "@/lib/logger";

type GlobalPrismaState = {
  prisma?: PrismaClient;
  prismaHooksRegistered?: boolean;
  prismaShutdownRegistered?: boolean;
};

const globalForPrisma = globalThis as unknown as GlobalPrismaState;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: [
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

function registerPrismaHooks(): void {
  if (globalForPrisma.prismaHooksRegistered) {
    return;
  }

  const eventClient = db as PrismaClient<Prisma.PrismaClientOptions, "warn" | "error">;

  eventClient.$on("warn", (event) => {
    logWarn("db.prisma.warn", {
      message: event.message,
      target: event.target,
    });
  });

  eventClient.$on("error", (event) => {
    logError("db.prisma.error", {
      message: event.message,
      target: event.target,
    });
  });

  globalForPrisma.prismaHooksRegistered = true;
}

function registerShutdownHooks(): void {
  if (globalForPrisma.prismaShutdownRegistered) {
    return;
  }

  const shutdown = async (signal: string) => {
    try {
      await db.$disconnect();
      logInfo("db.prisma.disconnected", { signal });
    } catch (error) {
      logError("db.prisma.disconnect_failed", {
        signal,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  process.once("beforeExit", () => {
    void shutdown("beforeExit");
  });

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  globalForPrisma.prismaShutdownRegistered = true;
}

registerPrismaHooks();
registerShutdownHooks();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
