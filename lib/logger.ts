type LogLevel = "info" | "warn" | "error";

type LogContext = {
  [key: string]: string | number | boolean | null | undefined;
};

type LogRecord = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
};

const isProduction = process.env.NODE_ENV === "production";
const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();
const isStaging = appEnv === "staging";
const levelWeight: Record<LogLevel, number> = {
  info: 10,
  warn: 20,
  error: 30,
};

function normalizeLogLevel(value: string | undefined): LogLevel {
  if (value === "info" || value === "warn" || value === "error") {
    return value;
  }

  if (isStaging) {
    return "info";
  }

  return isProduction ? "warn" : "info";
}

const minimumLogLevel = normalizeLogLevel(process.env.LOG_LEVEL?.trim().toLowerCase());

function shouldLog(level: LogLevel): boolean {
  return levelWeight[level] >= levelWeight[minimumLogLevel];
}

function createLogRecord(level: LogLevel, message: string, context?: LogContext): LogRecord {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };
}

function writeLog(level: LogLevel, record: LogRecord): void {
  if (!shouldLog(level)) {
    return;
  }

  if (isProduction) {
    const payload = JSON.stringify(record);

    if (level === "error") {
      console.error(payload);
      return;
    }

    if (level === "warn") {
      console.warn(payload);
      return;
    }

    console.info(payload);
    return;
  }

  const contextSuffix = record.context ? ` ${JSON.stringify(record.context)}` : "";
  const line = `[${record.timestamp}] ${record.level.toUpperCase()} ${record.message}${contextSuffix}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logInfo(message: string, context?: LogContext): void {
  writeLog("info", createLogRecord("info", message, context));
}

export function logWarn(message: string, context?: LogContext): void {
  writeLog("warn", createLogRecord("warn", message, context));
}

export function logError(message: string, context?: LogContext): void {
  writeLog("error", createLogRecord("error", message, context));
}
