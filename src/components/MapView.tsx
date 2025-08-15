"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type EventItem = {
  id: number;
  title: string;
  date_from: string;
  coords: { lat: number; lng: number };
  group: string;
  location: { continent: string; country: string; name: string };
};

export default function MapView() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Import di Leaflet SOLO lato client (evita “window is not defined”)
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const icon2x = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
      L.Marker.prototype.options.icon = new L.Icon({
        iconUrl,
        iconRetinaUrl: icon2x,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    })();
  }, []);

  // Carica eventi dal backend
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    const url = `${base}/events?lang=it`;
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => setItems(j.items || []))
      .catch((e) => setError(`/events failed: ${e.message}`));
  }, []);

  const tiles = `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

  return (
    <div style={{ height: "70vh", width: "100%" }}>
      <MapContainer center={[45.4642, 9.19]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url={tiles}
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; OpenStreetMap contributors'
        />
        {items.map((ev) => (
          <Marker key={ev.id} position={[ev.coords.lat, ev.coords.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{ev.title}</div>
                <div className="opacity-70">{ev.date_from}</div>
                <div className="opacity-70">
                  {ev.location.name} · {ev.location.country}
                </div>
                <div className="mt-1 text-xs">Gruppo: {ev.group}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {error && <div className="p-2 text-red-600 text-sm">API error: {error}</div>}
    </div>
  );
}




