// src/app/page.tsx
"use client";

import dynamic from "next/dynamic";

// disattiva SSG/SSR per questa pagina
export const revalidate = 0;
export const dynamic = "force-dynamic";

// IMPORTA QUI IL CONTENITORE "RICCO" (MapView o EventsBrowser)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Loading…</div>,
});

export default function Page() {
  return <MapView />;
}
