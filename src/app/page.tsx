"use client";

import dynamic from "next/dynamic";

// Evita il rendering lato server del componente che usa Leaflet
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">GeoHistory — MVP</h1>
      <p className="text-center text-sm text-gray-500">
        Tailwind attivo · React‑Leaflet attivo · Tiles MapTiler
      </p>
      <MapView />
    </main>
  );
}




