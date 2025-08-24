// src/app/HomeClient.tsx
"use client";

import dynamic from "next/dynamic";

// carica il container “ricco” della home (cambia il path se il tuo si chiama diverso)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Loading…</div>,
});

export default function HomeClient() {
  return <MapView />;
}
