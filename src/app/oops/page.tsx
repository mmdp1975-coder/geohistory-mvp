"use client";

export default function Oops() {
  // Forza un errore per testare Sentry
  throw new Error("Sentry test error (client)");
}
