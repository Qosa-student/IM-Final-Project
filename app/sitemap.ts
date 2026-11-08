import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/rooms";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rooms = await getRooms();
  const pages = [
    "",
    "/about",
    "/rooms",
    "/gallery",
    "/amenities",
    "/contact",
    "/terms",
    "/privacy",
  ];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...rooms.map((r) => ({
      url: `${base}/rooms/${r.id}`,
      lastModified: new Date(),
    })),
  ];
}
