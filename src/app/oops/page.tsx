"use client";

export default function Oops() {
  // genera un errore client-side per test
  throw new Error("Sentry test error (client)");
}
