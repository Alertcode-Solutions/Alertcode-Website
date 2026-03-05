import { featureFlags, runtimeConfig } from "@/lib/config";
import { logInfo } from "@/lib/logger";

export async function register() {
  if (!featureFlags.enableExperimentalFeatures) {
    return;
  }

  logInfo("instrumentation.register", {
    appEnv: runtimeConfig.appEnv,
    runtime: process.env.NEXT_RUNTIME ?? "nodejs",
  });
}
