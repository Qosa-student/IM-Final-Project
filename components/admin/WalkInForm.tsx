"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { checkAvailability, createWalkIn } from "@/app/actions";

type R = {
  id: number;
  name: string;
  category: "room" | "cottage";
  guests: number;
  price: number;
};

export default function WalkInForm({ rooms }: { rooms: R[] }) {
  const router = useRouter();
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? 0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [avail, setAvail] = useState<{
    available: boolean;
    left: number | null;
  } | null>(null);

  const room = rooms.find((r) => r.id === roomId);
  const isRoom = room?.category === "room";
  const diff =
    checkIn && checkOut
      ? Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000)
      : -1;
  const valid = diff >= (isRoom ? 1 : 0);
  const billed = valid ? Math.max(diff, 1) : 0;
  const total = room ? billed * Number(room.price) : 0;

  useEffect(() => {
    if (!room || !checkIn || !checkOut || !valid) {
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
  }, [room, checkIn, checkOut, valid]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const guests = Number(f.get("guests"));
    if (!room) return setError("Choose a room.");
    if (!valid) {
      return setError(
        isRoom
          ? "Check-out must be at least one day after check-in."
          : "Check-out can’t be before check-in. Use the same date for a day visit.",
      );
    }
    if (guests > room.guests)
      return setError(`This fits up to ${room.guests} guests.`);

    setBusy(true);
    setError("");
    const res = await createWalkIn({
      room_id: room.id,
      guest_name: String(f.get("name")),
      phone: String(f.get("phone") || ""),
      email: String(f.get("email") || ""),
      check_in: checkIn,
      check_out: checkOut,
      guests,
      notes: String(f.get("notes") || "") || null,
      status: f.get("status") === "pending" ? "pending" : "confirmed",
      paid: Number(f.get("paid") || 0),
      method: String(f.get("method")) as "cash" | "gcash" | "bank" | "other",
    });
    if (!res.ok) {
      setBusy(false);
      return setError(res.error);
    }
    router.push("/admin/bookings");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form admin-form">
      <label>
        Room
        <select
          value={roomId}
          onChange={(e) => setRoomId(Number(e.target.value))}
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} · up to {r.guests} guests · ₱
              {Number(r.price).toLocaleString()}
            </option>
          ))}
        </select>
      </label>
      <label>
        Guest name
        <input name="name" required />
      </label>
      <label>
        Phone (optional)
        <input name="phone" type="tel" />
      </label>
      <label>
        Email (optional)
        <input name="email" type="email" />
      </label>

      <div className="two-col">
        <label>
          Check-in
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </label>
        <label>
          Check-out
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </label>
      </div>
      {!isRoom && (
        <small className="muted">
          Day visit? Use the same date for check-in and check-out.
        </small>
      )}

      {avail && (
        <p className={`avail ${avail.available ? "ok" : "no"}`}>
          {avail.available
            ? "Available for these dates."
            : "Already booked for these dates. Saving as confirmed will be refused."}
        </p>
      )}

      <label>
        Guests
        <input name="guests" type="number" min={1} defaultValue={1} required />
      </label>
      <label>
        Notes (optional)
        <textarea name="notes" rows={2} />
      </label>
      <label>
        Status
        <select name="status" defaultValue="confirmed">
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
        </select>
      </label>
      {total > 0 && (
        <p className="total">
          Total: <b>₱{total.toLocaleString()}</b>
        </p>
      )}

      <div className="two-col">
        <label>
          Payment received now (₱, optional)
          <input
            name="paid"
            type="number"
            min={0}
            step="0.01"
            defaultValue={0}
          />
        </label>
        <label>
          Method
          <select name="method" defaultValue="cash">
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="bank">Bank transfer</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : "Save walk-in booking"}
      </button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
