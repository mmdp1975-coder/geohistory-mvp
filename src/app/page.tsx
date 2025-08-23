// src/app/page.tsx
"use client";

import dynamic from "next/dynamic";

// Import dinamico del componente mappa SOLO lato client
const EventMap = dynamic(() => import("@/components/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-center text-gray-600">Loading map…</div>
  ),
});

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="p-4 text-xl font-serif">GeoHistory — MVP</div>
      <EventMap />
    </main>
  );
}
