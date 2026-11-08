"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GalleryUpload() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const files = (f.getAll("files") as File[]).filter((x) => x.size > 0);
    if (!files.length) return setError("Choose at least one photo.");
    const supabase = createClient();
    setBusy(true);
    setError("");

    for (const file of files) {
      const path = `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("room-images")
        .upload(path, file);
      if (upErr) {
        setBusy(false);
        return setError(upErr.message);
      }
      const url = supabase.storage.from("room-images").getPublicUrl(path)
        .data.publicUrl;
      const { error: dbErr } = await supabase
        .from("gallery_images")
        .insert({ url, caption: String(f.get("caption") || "") || null });
      if (dbErr) {
        setBusy(false);
        return setError(dbErr.message);
      }
    }
    form.reset();
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form admin-form">
      <label>
        Photos (you can pick several)
        <input name="files" type="file" accept="image/*" multiple />
      </label>
      <label>
        Caption (optional, applies to all selected)
        <input name="caption" />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Uploading…" : "Upload"}
      </button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
