import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Sentry test error (server)");
  } catch (e) {
    Sentry.captureException(e as any);
    throw e; // restituisce 500
  }
}

