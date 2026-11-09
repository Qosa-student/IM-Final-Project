"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { amenityIcons } from "@/lib/amenities";
import { createClient } from "@/lib/supabase/client";

export default function AmenityForm() {
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
      .from("amenities")
      .insert({
        name: String(f.get("name")),
        icon: String(f.get("icon")),
        sort: 99,
      });
    setBusy(false);
    if (dbErr) return setError(dbErr.message);
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form admin-form">
      <label>
        Name
        <input name="name" placeholder="e.g. Free Wi-Fi" required />
      </label>
      <label>
        Icon
        <select name="icon" defaultValue="palm">
          {Object.keys(amenityIcons).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Adding…" : "Add amenity"}
      </button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
