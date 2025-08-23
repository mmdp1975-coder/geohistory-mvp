import 'leaflet/dist/leaflet.css';

// geohistory-mvp/src/app/layout.tsx
export const metadata = {
  title: "GeoHistory",
  description: "GeoHistory MVP",
};

// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* evita mismatch da estensioni come Grammarly */}
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}




