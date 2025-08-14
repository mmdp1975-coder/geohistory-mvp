export const metadata = {
  title: "GeoHistory — MVP",
  description: "Prototipo con Next.js, Tailwind e React‑Leaflet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}


