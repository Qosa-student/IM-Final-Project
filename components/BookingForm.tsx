"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { checkAvailability, createBooking } from "@/app/actions";
import type { Room } from "@/lib/types";

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function BookingForm({
  room,
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
  const unit = isRoom ? "night" : "day";
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [avail, setAvail] = useState<{
    available: boolean;
    left: number | null;
  } | null>(null);

  const diff =
    checkIn && checkOut
      ? Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000)
      : -1;
  const valid = diff >= (isRoom ? 1 : 0);
  const billed = valid ? Math.max(diff, 1) : 0;
  const total = billed * Number(room.price);

  useEffect(() => {
    if (!checkIn || !checkOut || !valid) {
      setAvail(null);
      return;
    }
    let cancelled = false;
    checkAvailability(room.id, checkIn, checkOut).then((r) => {
      if (!cancelled) setAvail(r);
    });
    return () => {
      cancelled = true;
    };
  }, [room.id, checkIn, checkOut, valid]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const guests = Number(f.get("guests"));
    setError("");

    if (!valid) {
      return setError(
        isRoom
          ? "Check-out must be at least one day after check-in."
          : "Check-out can’t be before check-in. Use the same date for a day visit.",
      );
    }
    if (guests > room.guests)
      return setError(
        `This ${isRoom ? "room" : "cottage"} fits up to ${room.guests} guests.`,
      );

    setBusy(true);
    const res = await createBooking({
      room_id: room.id,
      guest_name: String(f.get("name")),
      email: String(f.get("email")),
      phone: String(f.get("phone")),
      check_in: checkIn,
      check_out: checkOut,
      guests,
      notes: String(f.get("notes") || "") || null,
    });
    if (!res.ok) {
      setBusy(false);
      return setError(res.error);
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
      {!isRoom && (
        <small className="muted">
          Visiting for the day? Pick the same date for check-in and check-out.
        </small>
      )}

      {avail && (
        <p className={`avail ${avail.available ? "ok" : "no"}`}>
          {avail.available
            ? "Good news, this is available for your dates."
            : "Sorry, this is already booked for those dates. Please choose other dates."}
        </p>
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

      <p className="total">
        {billed > 0 ? (
          <>
            {billed} {unit}
            {billed === 1 ? "" : "s"} × ₱{Number(room.price).toLocaleString()} ={" "}
            <b>₱{total.toLocaleString()}</b>
          </>
        ) : (
          <>
            Rate: <b>₱{Number(room.price).toLocaleString()}</b> per {unit}
          </>
        )}
      </p>

      <button className="btn" disabled={busy || avail?.available === false}>
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
