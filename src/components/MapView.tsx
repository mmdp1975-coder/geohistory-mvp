"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

type GeoPoint = { type: "Point"; coordinates: [number, number] } | null;

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_year: number | null;
  group_event: string | null;
  continent: string | null;
  country: string | null;
  location: string | null;
  wikipedia_url: string | null;
  image_url: string | null;
  coordinates: GeoPoint; // GeoJSON [lng, lat]
};

type ApiResponse = {
  items: EventItem[];
  limit: number;
  offset: number;
};

function toLatLng(geom: GeoPoint): [number, number] | null {
  if (!geom || geom.type !== "Point") return null;
  const [lng, lat] = geom.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return [lat, lng];
}

export default function MapView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/events?limit=500&order=asc`;
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`API ${res.status}: ${text || res.statusText}`);
        }
        const json: ApiResponse = await res.json();
        setEvents((json.items || []).filter((e) => toLatLng(e.coordinates)));
      } catch (e: any) {
        console.error("Error fetching events:", e);
        setErr(e?.message || "Errore nel caricamento degli eventi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="w-full">
      {err ? (
        <div className="mx-auto max-w-3xl text-red-600 text-sm border border-red-300 rounded p-3 mb-2">
          Errore: {err}
        </div>
      ) : null}

      <MapContainer center={[20, 0]} zoom={2} style={{ height: "75vh", width: "100%" }}>
        <TileLayer
          url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        {!loading &&
          events.map((event) => {
            const latlng = toLatLng(event.coordinates);
            if (!latlng) return null;
            return (
              <Marker key={event.id} position={latlng} icon={markerIcon}>
                <Popup>
                  <div className="space-y-1">
                    <div className="font-bold">{event.title}</div>
                    {event.event_year !== null && (
                      <div>
                        <strong>Year:</strong> {event.event_year}
                      </div>
                    )}
                    <div className="text-sm opacity-80">
                      {[event.location, event.country, event.continent].filter(Boolean).join(" · ")}
                    </div>
                    {event.description && <p className="text-sm mt-1">{event.description}</p>}
                    {event.wikipedia_url && (
                      <a href={event.wikipedia_url} target="_blank" rel="noreferrer" className="underline text-sm">
                        Wikipedia
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}






