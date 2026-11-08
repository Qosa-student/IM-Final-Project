"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Room } from "@/lib/types";

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function BookingForm({
  room,
  userId,
  defaultName,
  defaultEmail,
}: {
  room: Room;
  userId: string;
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const isRoom = room.category === "room";
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const nights =
    isRoom && checkIn && checkOut
      ? Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000)
      : 0;
  const total = isRoom
    ? Math.max(nights, 0) * Number(room.price)
    : Number(room.price);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const guests = Number(f.get("guests"));
    setError("");

    if (isRoom && nights < 1)
      return setError("Check-out must be at least one day after check-in.");
    if (guests > room.guests)
      return setError(
        `This ${isRoom ? "room" : "cottage"} fits up to ${room.guests} guests.`,
      );

    setBusy(true);
    const { error: dbErr } = await createClient()
      .from("bookings")
      .insert({
        user_id: userId,
        room_id: room.id,
        guest_name: String(f.get("name")),
        email: String(f.get("email")),
        phone: String(f.get("phone")),
        check_in: checkIn,
        check_out: isRoom ? checkOut : checkIn,
        guests,
        notes: String(f.get("notes") || "") || null,
      });
    if (dbErr) {
      setBusy(false);
      return setError(dbErr.message);
    }
    router.push("/account/bookings?sent=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form admin-form book-form">
      <label>
        Full name
        <input name="name" defaultValue={defaultName} required />
      </label>
      <label>
        Email
        <input name="email" type="email" defaultValue={defaultEmail} required />
      </label>
      <label>
        Phone
        <input name="phone" type="tel" placeholder="09XXXXXXXXX" required />
      </label>
      {isRoom ? (
        <div className="two-col">
          <label>
            Check-in
            <input
              type="date"
              min={today()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </label>
          <label>
            Check-out
            <input
              type="date"
              min={checkIn || today()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </label>
        </div>
      ) : (
        <label>
          Visit date
          <input
            type="date"
            min={today()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </label>
      )}
      <label>
        Guests (max {room.guests})
        <input
          name="guests"
          type="number"
          min={1}
          max={room.guests}
          defaultValue={1}
          required
        />
      </label>
      <label>
        Notes (optional)
        <textarea
          name="notes"
          rows={3}
          placeholder="Arrival time, special requests…"
        />
      </label>
      {total > 0 && (
        <p className="total">
          {isRoom
            ? `${nights} night${nights === 1 ? "" : "s"} × ₱${Number(room.price).toLocaleString()} = `
            : "Rate: "}
          <b>₱{total.toLocaleString()}</b>
        </p>
      )}
      <button className="btn" disabled={busy}>
        {busy ? "Sending…" : "Request booking"}
      </button>
      {error && <p className="err">{error}</p>}
      <small className="muted">
        This is a request. We’ll confirm availability by email or phone. No
        payment is taken online.
      </small>
    </form>
  );
}
