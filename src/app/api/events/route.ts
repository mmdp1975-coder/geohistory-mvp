// src/app/api/events/route.ts
import { NextResponse } from "next/server";

// Mock: qualche evento in Italia
const ALL_EVENTS = [
  { id: "roma", title: "Fondazione di Roma (mito)", year: -753, lat: 41.8902, lng: 12.4922 },
  { id: "firenze", title: "Nascita del Rinascimento fiorentino", year: 1401, lat: 43.7696, lng: 11.2558 },
  { id: "milano", title: "Editto di Milano", year: 313, lat: 45.4642, lng: 9.1900 },
  { id: "venezia", title: "Repubblica di Venezia (apogeo)", year: 1500, lat: 45.4408, lng: 12.3155 },
];

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // bbox = minLat,minLng,maxLat,maxLng
  const bbox = searchParams.get("bbox");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let items = [...ALL_EVENTS];

  // Filtra per anni, se forniti
  const fromYear = from ? Number(from) : undefined;
  const toYear = to ? Number(to) : undefined;
  if (!Number.isNaN(fromYear) || !Number.isNaN(toYear)) {
    items = items.filter((e) => {
      if (fromYear !== undefined && e.year < fromYear) return false;
      if (toYear !== undefined && e.year > toYear) return false;
      return true;
    });
  }

  // Filtra per bbox, se fornita
  if (bbox) {
    const [minLat, minLng, maxLat, maxLng] = bbox.split(",").map(Number);
    items = items.filter((e) => e.lat >= minLat && e.lat <= maxLat && e.lng >= minLng && e.lng <= maxLng);
  }

  return NextResponse.json({ events: items });
}
