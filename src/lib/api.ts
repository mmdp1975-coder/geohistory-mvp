export async function fetchEvents(lang: "it" | "en" = "it") {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  const url = `${base}/events?lang=${lang}`;
  console.log("FETCH URL:", url); // <— deve stampare http://localhost:3001/events?...
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`API /events failed: ${res.status}`);
  const json = await res.json();
  return json.items as import("../types").EventItem[];
}

