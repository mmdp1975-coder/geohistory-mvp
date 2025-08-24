// src/app/map/MapClient.tsx
"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Carico mappa…</div>,
});

export default function MapClient() {
  console.log("[MapClient] rendering MapView");
  return (
    <main style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>GeoHistory — Events Map</h1>
        <small>UI completa (MapView)</small>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapView />
      </div>
    </main>
  );
}
