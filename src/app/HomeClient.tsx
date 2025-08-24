// src/app/HomeClient.tsx
"use client";

import dynamic from "next/dynamic";

// Forzo la UI completa: MapView (no SSR)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Carico…</div>,
});

export default function HomeClient() {
  console.log("[HomeClient] rendering MapView");
  return <MapView />;
}
