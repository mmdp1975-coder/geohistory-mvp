// src/app/page.tsx
import dynamic from "next/dynamic";

const EventMap = dynamic(() => import("@/components/EventMap"), {
  // IMPORTANT: niente SSR per Leaflet/DOM
  ssr: false,
  loading: () => (
    <div className="p-6 text-center text-gray-600">Loading map…</div>
  ),
});

export default function Page() {
  return (
    <main className="w-full h-[100dvh]">
      <EventMap />
    </main>
  );
}