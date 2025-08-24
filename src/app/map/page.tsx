// src/app/map/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ⬇️ NON usare 'use client' qui: questa è una Server Route.
// Delego al client wrapper che carica Leaflet lato client.
import MapClient from "./MapClient";

export default function MapPage() {
  return <MapClient />;
}



