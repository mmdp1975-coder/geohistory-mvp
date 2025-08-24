// src/app/HomeClient.tsx
"use client";

import dynamic from "next/dynamic";

// 👇 USA il componente completo della 2.8
const EventsBrowser = dynamic(
  () => import("@/components/EventsBrowser"),
  { ssr: false, loading: () => <div style={{ padding: 12 }}>Carico…</div> }
);

export default function HomeClient() {
  return <EventsBrowser />;
}
