"use client";

import dynamic from "next/dynamic";

// carico il componente Map disattivando l'SSR
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapClient() {
  return <Map />;
}
