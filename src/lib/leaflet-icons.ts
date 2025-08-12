import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

declare global {
  interface Window {
    __leafletPatched?: boolean;
  }
}

export function patchLeafletIcons() {
  if (typeof window !== "undefined" && window.__leafletPatched) return;
  L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
  if (typeof window !== "undefined") window.__leafletPatched = true;
}

