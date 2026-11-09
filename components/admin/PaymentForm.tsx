"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PaymentForm({
  bookings,
}: {
  bookings: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError("");
    const { error: dbErr } = await createClient()
      .from("payments")
      .insert({
        booking_id: Number(f.get("booking")) || null,
        amount: Number(f.get("amount")),
        method: String(f.get("method")),
        note: String(f.get("note") || "") || null,
      });
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form admin-form">
      <label>
        Booking
        <select name="booking" defaultValue="">
          <option value="">No booking (walk-in / other)</option>
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Amount (₱)
        <input name="amount" type="number" min={1} step="0.01" required />
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
      <label>
        Note (optional)
        <input name="note" />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : "Record payment"}
      </button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
