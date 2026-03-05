import { createServer } from "node:net";
import { resolve } from "node:path";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

const FIXED_PORT = 8080;
const mode = process.argv[2];

if (mode !== "dev" && mode !== "start") {
  console.error("Invalid mode. Use 'dev' or 'start'.");
  process.exit(1);
}

function ensurePortAvailable(port) {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();

    server.once("error", (error) => {
      rejectPromise(error);
    });

    server.once("listening", () => {
      server.close(() => resolvePromise());
    });

    server.listen(port, "0.0.0.0");
  });
}

function createStartCommand() {
  if (mode === "dev") {
    const nextBin = resolve("node_modules", "next", "dist", "bin", "next");
    return {
      command: process.execPath,
      args: [nextBin, "dev", "-p", String(FIXED_PORT)],
      env: process.env,
    };
  }

  const standaloneRoot = resolve(".next", "standalone");
  const standaloneServer = resolve(standaloneRoot, "server.js");

  if (existsSync(standaloneServer)) {
    const standaloneNextDir = resolve(standaloneRoot, ".next");
    const standaloneStaticDir = resolve(standaloneNextDir, "static");
    const standalonePublicDir = resolve(standaloneRoot, "public");

    mkdirSync(standaloneNextDir, { recursive: true });

    if (existsSync(resolve(".next", "static"))) {
      cpSync(resolve(".next", "static"), standaloneStaticDir, { recursive: true, force: true });
    }

    if (existsSync(resolve("public"))) {
      cpSync(resolve("public"), standalonePublicDir, { recursive: true, force: true });
    }

    return {
      command: process.execPath,
      args: [standaloneServer],
      env: {
        ...process.env,
        PORT: String(FIXED_PORT),
        HOSTNAME: process.env.HOSTNAME ?? "0.0.0.0",
      },
      cwd: standaloneRoot,
    };
  }

  const nextBin = resolve("node_modules", "next", "dist", "bin", "next");
  return {
    command: process.execPath,
    args: [nextBin, "start", "-p", String(FIXED_PORT)],
    env: process.env,
  };
}

async function run() {
  try {
    await ensurePortAvailable(FIXED_PORT);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE") {
      console.error(`Port ${FIXED_PORT} is already in use. Stop the process using this port and try again.`);
      process.exit(1);
    }

    console.error("Unable to verify port availability.");
    process.exit(1);
  }

  const command = createStartCommand();

  const child = spawn(command.command, command.args, {
    stdio: "inherit",
    env: command.env,
    cwd: command.cwd ?? process.cwd(),
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

void run();
