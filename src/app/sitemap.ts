import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://geohistory-mvp.vercel.app/", lastModified: new Date() },
    { url: "https://geohistory-mvp.vercel.app/admin", lastModified: new Date() },
  ];
}