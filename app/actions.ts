"use server";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (
    !input.name ||
    !input.email ||
    !input.message ||
    input.message.length > 5000
  )
    return { ok: false as const };
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    name: input.name,
    email: input.email,
    subject: input.subject || null,
    message: input.message,
  });
  return error ? { ok: false as const } : { ok: true as const };
}

export async function createBooking(input: {
  room_id: number;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  notes: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please log in again." };

  const { data: room } = await supabase
    .from("rooms")
    .select("price, category")
    .eq("id", input.room_id)
    .single();
  if (!room) return { ok: false as const, error: "Room not found." };

  const nights =
    room.category === "room"
      ? Math.max(
          1,
          Math.round(
            (+new Date(input.check_out) - +new Date(input.check_in)) / 86400000,
          ),
        )
      : 1;
  const total = Number(room.price) * nights;

  const { error } = await supabase
    .from("bookings")
    .insert({ ...input, user_id: user.id, total });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

type Status = "pending" | "confirmed" | "declined" | "cancelled";

export async function setBookingStatus(id: number, status: Status) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { ok: false as const, error: "Not allowed." };

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
