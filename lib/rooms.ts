import { createClient } from "@/lib/supabase/server";
import type { Room } from "@/lib/types";

const fallback: Room[] = [
  {
    id: 1,
    name: "Executive Room",
    category: "room",
    guests: 2,
    beds: 1,
    size_sqm: 20,
    tables_count: null,
    chairs: null,
    price: 3500,
    image: "executive.png",
    sort: 1,
  },
  {
    id: 2,
    name: "Dorm Type",
    category: "room",
    guests: 4,
    beds: 2,
    size_sqm: 30,
    tables_count: null,
    chairs: null,
    price: 4500,
    image: "dorm-4.png",
    sort: 2,
  },
  {
    id: 3,
    name: "Dorm Type",
    category: "room",
    guests: 8,
    beds: 4,
    size_sqm: 45,
    tables_count: null,
    chairs: null,
    price: 5500,
    image: "dorm-8.png",
    sort: 3,
  },
  {
    id: 4,
    name: "Tables with Bench",
    category: "cottage",
    guests: 8,
    beds: null,
    size_sqm: null,
    tables_count: 2,
    chairs: 10,
    price: 500,
    image: "bench.png",
    sort: 4,
  },
  {
    id: 5,
    name: "Open Cottage",
    category: "cottage",
    guests: 8,
    beds: null,
    size_sqm: null,
    tables_count: 2,
    chairs: 10,
    price: 800,
    image: "cottage-8.png",
    sort: 5,
  },
  {
    id: 6,
    name: "Open Cottage",
    category: "cottage",
    guests: 20,
    beds: null,
    size_sqm: null,
    tables_count: 6,
    chairs: 25,
    price: 1500,
    image: "cottage-20.png",
    sort: 6,
  },
];

// Reads from Supabase; falls back to static data if the DB is empty/unreachable.
export async function getRooms(limit?: number): Promise<Room[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("sort");
    if (!error && data?.length) return limit ? data.slice(0, limit) : data;
  } catch {}
  return limit ? fallback.slice(0, limit) : fallback;
}
