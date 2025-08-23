"use client";

import dynamic from "next/dynamic";

// Carico la mappa solo lato client (niente SSR)
const EventMap = dynamic(() => import("@/components/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-center text-gray-600">Loading map…</div>
  ),
});

export default function MapPage() {
  return <EventMap />;
}
