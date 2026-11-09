"use server";
import { createClient } from "@/lib/supabase/server";

const friendly = (m: string) =>
  m.includes("ROOM_UNAVAILABLE")
    ? "This room is already booked for those dates."
    : m;

const daysBetween = (a: string, b: string) =>
  Math.round((+new Date(b) - +new Date(a)) / 86400000);

async function requireAdmin() {
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
  return { ok: true as const, supabase };
}

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

// Live availability check used by the booking forms
export async function checkAvailability(
  roomId: number,
  checkIn: string,
  checkOut: string,
) {
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("units, category")
    .eq("id", roomId)
    .single();
  if (!room || !checkIn || !checkOut)
    return { available: true, left: null as number | null };
  const days = daysBetween(checkIn, checkOut);
  if (days < (room.category === "room" ? 1 : 0))
    return { available: true, left: null as number | null };

  const { data: taken } = await supabase.rpc("room_booked_count", {
    p_room: roomId,
    p_in: checkIn,
    p_out: checkOut,
  });
  const units = room.units ?? 1;
  const used = Number(taken ?? 0);
  return {
    available: used < units,
    left: Math.max(units - used, 0) as number | null,
  };
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
    .select("price, category, units")
    .eq("id", input.room_id)
    .single();
  if (!room) return { ok: false as const, error: "Room not found." };

  const days = daysBetween(input.check_in, input.check_out);
  if (days < (room.category === "room" ? 1 : 0)) {
    return { ok: false as const, error: "Please check your dates." };
  }

  const { data: taken } = await supabase.rpc("room_booked_count", {
    p_room: input.room_id,
    p_in: input.check_in,
    p_out: input.check_out,
  });
  if (Number(taken ?? 0) >= (room.units ?? 1)) {
    return {
      ok: false as const,
      error:
        "Sorry, this is already booked for those dates. Please choose other dates.",
    };
  }

  const total = Number(room.price) * Math.max(days, 1);

  const { error } = await supabase
    .from("bookings")
    .insert({ ...input, user_id: user.id, total });
  if (error) return { ok: false as const, error: friendly(error.message) };
  return { ok: true as const };
}

type Status = "pending" | "confirmed" | "declined" | "cancelled";

export async function setBookingStatus(id: number, status: Status) {
  const a = await requireAdmin();
  if (!a.ok) return { ok: false as const, error: a.error };

  const { error } = await a.supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false as const, error: friendly(error.message) };
  return { ok: true as const };
}

// Admin creates a booking for a walk-in or phone-in guest
export async function createWalkIn(input: {
  room_id: number;
  guest_name: string;
  phone: string;
  email: string;
  check_in: string;
  check_out: string;
  guests: number;
  notes: string | null;
  status: "confirmed" | "pending";
  paid: number;
  method: "cash" | "gcash" | "bank" | "other";
}) {
  const a = await requireAdmin();
  if (!a.ok) return { ok: false as const, error: a.error };
  const { supabase } = a;

  const { data: room } = await supabase
    .from("rooms")
    .select("price, category")
    .eq("id", input.room_id)
    .single();
  if (!room) return { ok: false as const, error: "Room not found." };

  const days = daysBetween(input.check_in, input.check_out);
  if (days < (room.category === "room" ? 1 : 0)) {
    return { ok: false as const, error: "Please check your dates." };
  }
  const total = Number(room.price) * Math.max(days, 1);

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      room_id: input.room_id,
      guest_name: input.guest_name,
      email: input.email || "",
      phone: input.phone || "",
      check_in: input.check_in,
      check_out: input.check_out,
      guests: input.guests,
      notes: input.notes,
      status: input.status,
      total,
      user_id: null,
      source: "walk-in",
    })
    .select("id")
    .single();
  if (error || !booking)
    return {
      ok: false as const,
      error: friendly(error?.message ?? "Could not save the booking."),
    };

  if (input.paid > 0) {
    await supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        amount: input.paid,
        method: input.method,
      });
  }
  return { ok: true as const };
}
