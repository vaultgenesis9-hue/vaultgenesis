import * as Sentry from "@sentry/node";

export function initSentryBackend() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
    // Capture unhandled promise rejections
    integrations: [
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
    ],
  });

  console.log("[Sentry] Backend error tracking initialized");
}

export { Sentry };
