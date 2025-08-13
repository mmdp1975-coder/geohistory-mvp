import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // bbox = minLat,minLng,maxLat,maxLng
  const bboxStr = searchParams.get("bbox");
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const from =
    fromStr !== null && fromStr !== "" ? Number(fromStr) : null;
  const to =
    toStr !== null && toStr !== "" ? Number(toStr) : null;

  // default: mondo intero se bbox mancante o malformato
  let min_lat = -90,
    min_lng = -180,
    max_lat = 90,
    max_lng = 180;

  if (bboxStr) {
    const parts = bboxStr.split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      [min_lat, min_lng, max_lat, max_lng] = parts;
    }
  }

  const { data, error } = await supabase.rpc("events_in_bbox", {
    min_lat,
    min_lng,
    max_lat,
    max_lng,
    from_year: from,
    to_year: to,
  });

  if (error) {
    console.error("Supabase RPC error:", error.message);
    const errRes = NextResponse.json(
      { events: [], error: error.message },
      { status: 500 }
    );
    // cache breve anche in errore
    errRes.headers.set(
      "Cache-Control",
      "s-maxage=10, stale-while-revalidate=60"
    );
    return errRes;
  }

  // risposta OK con cache edge
  const res = NextResponse.json({ events: data ?? [] });
  res.headers.set(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate=300"
  );
  return res;
}

