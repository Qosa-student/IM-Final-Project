"use client";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setStatus("sending");
    const { error } = await createClient()
      .from("reviews")
      .insert({
        user_id: userId,
        name: String(f.get("name")),
        rating,
        comment: String(f.get("comment")),
      });
    if (error) return setStatus("error");
    form.reset();
    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="form review-form">
      <h3>Share your stay</h3>
      <div className="star-pick" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= rating ? "on" : ""}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            ★
          </button>
        ))}
      </div>
      <input
        name="name"
        placeholder="Your name"
        defaultValue={defaultName}
        required
      />
      <textarea
        name="comment"
        placeholder="Tell us about your stay…"
        rows={4}
        required
      />
      <button className="btn" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Submit review"}
      </button>
      {status === "sent" && (
        <p className="ok">Thank you! Your review will appear once approved.</p>
      )}
      {status === "error" && (
        <p className="err">Couldn’t send your review. Please try again.</p>
      )}
    </form>
  );
}
