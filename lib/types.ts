export type Room = {
  id: number;
  name: string;
  category: "room" | "cottage";
  guests: number;
  beds: number | null;
  size_sqm: number | null;
  tables_count: number | null;
  chairs: number | null;
  price: number;
  image: string | null;
  sort: number;
  description?: string | null;
  units?: number;
};
export type Role = "user" | "admin";
