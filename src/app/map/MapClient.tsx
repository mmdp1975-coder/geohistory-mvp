// src/app/map/MapClient.tsx
"use client";

import dynamic from "next/dynamic";

// se il “full” è EventsBrowser, usa quello;
// altrimenti cambia la riga sotto in "@/components/EventMap"
const FullMap = dynamic(() => import("@/components/EventsBrowser"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 12, textAlign: "center", color: "#555" }}>
      Carico la mappa…
    </div>
  ),
});

export default function MapClient() {
  return (
    <main style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>GeoHistory — Events Map</h1>
        <small>UI completa</small>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <FullMap />
      </div>
    </main>
  );
}
