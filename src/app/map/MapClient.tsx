// src/app/map/MapClient.tsx
'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Carico mappa…</div>,
});

export default function MapClient() {
  return <MapView />;
}

