"use server";
import { createClient } from "@/lib/supabase/server";
import { esc, sendEmail } from "@/lib/email";

const ADMIN = process.env.ADMIN_EMAIL;

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
  if (error) return { ok: false as const };
  if (ADMIN)
    await sendEmail({
      to: ADMIN,
      subject: `New message: ${input.subject || "No subject"}`,
      html: `<p><b>${esc(input.name)}</b> (${esc(input.email)}) wrote:</p><p>${esc(input.message)}</p>`,
    });
  return { ok: true as const };
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

  const { error } = await supabase
    .from("bookings")
    .insert({ ...input, user_id: user.id });
  if (error) return { ok: false as const, error: error.message };

  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("id", input.room_id)
    .single();
  const dates =
    input.check_out !== input.check_in
      ? `${input.check_in} to ${input.check_out}`
      : input.check_in;
  const summary = `${esc(room?.name ?? "Room")} · ${dates} · ${input.guests} guest(s)`;

  if (ADMIN)
    await sendEmail({
      to: ADMIN,
      subject: `New booking request from ${input.guest_name}`,
      html: `<p><b>${esc(input.guest_name)}</b> · ${esc(input.email)} · ${esc(input.phone)}</p><p>${summary}</p><p>${esc(input.notes ?? "")}</p>`,
    });
  await sendEmail({
    to: input.email,
    subject: "We received your booking request",
    html: `<p>Hi ${esc(input.guest_name)},</p><p>Thanks for your request: ${summary}.</p><p>We’ll confirm availability soon. You can follow its status under My Bookings on our website.</p><p>D’Bay Samal Beach &amp; Resort</p>`,
  });
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

  const { data: b, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("*, rooms(name)")
    .single();
  if (error || !b)
    return {
      ok: false as const,
      error: error?.message ?? "Booking not found.",
    };

  if (status === "confirmed" || status === "declined") {
    const room = b.rooms as unknown as { name: string } | null;
    const roomName = esc(room?.name ?? "your stay");
    const dates =
      b.check_out !== b.check_in
        ? `${b.check_in} to ${b.check_out}`
        : b.check_in;
    await sendEmail({
      to: b.email,
      subject:
        status === "confirmed"
          ? "Your booking is confirmed"
          : "About your booking request",
      html:
        status === "confirmed"
          ? `<p>Hi ${esc(b.guest_name)},</p>
           <p>Good news! Your booking for <b>${roomName}</b> (${dates}) is <b>confirmed</b>.</p>
           <p><b>Check-in:</b> from 2:00 PM<br />
           <b>Check-out:</b> until 12:00 NN</p>
           <p>Please bring a valid ID when you arrive.</p>
           <p>Need to change something? Call us at 09086776094 or reply to this email.</p>
           <p>We look forward to welcoming you!<br />D’Bay Samal Beach &amp; Resort</p>`
          : `<p>Hi ${esc(b.guest_name)},</p>
           <p>Sorry, we can’t accommodate your request for <b>${roomName}</b> (${dates}). Please contact us at 09086776094 to find other dates.</p>
           <p>D’Bay Samal Beach &amp; Resort</p>`,
    });
  }
  return { ok: true as const };
}
