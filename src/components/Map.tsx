"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { patchLeafletIcons } from "@/lib/leaflet-icons";
import { useSelection } from "@/store/useSelection";
import { useFilters } from "@/store/useFilters";

type ApiEvent = { id: string; title: string; year: number; lat: number; lng: number };

function BboxLoader({ setEvents }: { setEvents: (ev: ApiEvent[]) => void }) {
  const map = useMap();
  const { from, to } = useFilters();

  const queryFromTo = useMemo(() => {
    const p = new URLSearchParams();
    if (from !== undefined && !Number.isNaN(from)) p.set("from", String(from));
    if (to !== undefined && !Number.isNaN(to)) p.set("to", String(to));
    return p.toString(); // "" oppure "from=...&to=..."
  }, [from, to]);

  async function load() {
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
    const url = `/api/events?bbox=${bbox}${queryFromTo ? `&${queryFromTo}` : ""}`;

    const res = await fetch(url);
    const data = await res.json();
    setEvents(Array.isArray(data.events) ? data.events : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 0)); // lascia inizializzare la mappa
      if (!cancelled) await load();
    })();

    const handler = () => load();
    map.on("moveend", handler);
    map.on("zoomend", handler);

    return () => {
      cancelled = true;
      map.off("moveend", handler);
      map.off("zoomend", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // ricarica quando cambiano i filtri
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromTo]);

  return null;
}

export default function Map() {
  const { setSelected } = useSelection();
  const [events, setEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
    patchLeafletIcons();
  }, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={[41.9028, 12.4964]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>

        {/* Caricatore che reagisce a bbox e ai filtri from/to */}
        <BboxLoader setEvents={setEvents} />

        {events.map((e) => (
          <Marker
            key={e.id}
            position={[e.lat, e.lng]}
            eventHandlers={{ click: () => setSelected({ title: e.title, year: e.year, lat: e.lat, lng: e.lng }) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{e.title}</div>
                <div>Anno: {e.year}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}







