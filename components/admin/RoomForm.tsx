"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { roomImage } from "@/lib/image";
import type { Room } from "@/lib/types";

const num = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : Number(v);

export default function RoomForm({ room }: { room?: Room }) {
  const router = useRouter();
  const [category, setCategory] = useState<"room" | "cottage">(
    room?.category ?? "room",
  );
  const [preview, setPreview] = useState(roomImage(room?.image ?? null) ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isRoom = category === "room";

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const supabase = createClient();
    setBusy(true);
    setError("");

    let image = room?.image ?? null;
    const file = f.get("image") as File;
    if (file && file.size > 0) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("room-images")
        .upload(path, file);
      if (upErr) {
        setBusy(false);
        return setError(upErr.message);
      }
      image = supabase.storage.from("room-images").getPublicUrl(path)
        .data.publicUrl;
    }

    const payload = {
      name: String(f.get("name")),
      category,
      image,
      description: String(f.get("description") || "") || null,
      guests: num(f.get("guests")),
      price: num(f.get("price")),
      sort: num(f.get("sort")) ?? 0,
      beds: isRoom ? num(f.get("beds")) : null,
      size_sqm: isRoom ? num(f.get("size_sqm")) : null,
      tables_count: isRoom ? null : num(f.get("tables_count")),
      chairs: isRoom ? null : num(f.get("chairs")),
      units: num(f.get("units")) ?? 1,
    };
    const { error: dbErr } = room
      ? await supabase.from("rooms").update(payload).eq("id", room.id)
      : await supabase.from("rooms").insert(payload);

    if (dbErr) {
      setBusy(false);
      return setError(dbErr.message);
    }
    router.push("/admin/rooms");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form admin-form">
      <label>
        Name
        <input name="name" defaultValue={room?.name} required />
      </label>
      <label>
        Type
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "room" | "cottage")}
        >
          <option value="room">Room (beds + size)</option>
          <option value="cottage">Cottage / table (tables + chairs)</option>
        </select>
      </label>
      <label>
        Guests
        <input
          name="guests"
          type="number"
          min={1}
          defaultValue={room?.guests}
          required
        />
      </label>
      {isRoom ? (
        <>
          <label>
            Beds
            <input
              name="beds"
              type="number"
              min={1}
              defaultValue={room?.beds ?? ""}
              required
            />
          </label>
          <label>
            Size (m²)
            <input
              name="size_sqm"
              type="number"
              min={1}
              defaultValue={room?.size_sqm ?? ""}
              required
            />
          </label>
        </>
      ) : (
        <>
          <label>
            Tables
            <input
              name="tables_count"
              type="number"
              min={1}
              defaultValue={room?.tables_count ?? ""}
              required
            />
          </label>
          <label>
            Chairs
            <input
              name="chairs"
              type="number"
              min={1}
              defaultValue={room?.chairs ?? ""}
              required
            />
          </label>
        </>
      )}
      <label>
        Price (₱){isRoom && " per night"}
        <input
          name="price"
          type="number"
          min={0}
          defaultValue={room?.price}
          required
        />
      </label>
      <label>
        Units available (how many identical rooms)
        <input
          name="units"
          type="number"
          min={1}
          defaultValue={room?.units ?? 1}
          required
        />
      </label>
      <label>
        Display order (1 = first)
        <input name="sort" type="number" defaultValue={room?.sort ?? 0} />
      </label>
      <label>
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={room?.description ?? ""}
        />
      </label>
      <label>
        Photo (16:10 landscape works best)
        <input name="image" type="file" accept="image/*" onChange={onPick} />
      </label>
      {preview && <img className="preview" src={preview} alt="Preview" />}
      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : room ? "Save changes" : "Add room"}
      </button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
