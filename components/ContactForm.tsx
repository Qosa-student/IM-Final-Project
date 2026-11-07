"use client";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setStatus("sending");
    const { error } = await createClient()
      .from("messages")
      .insert({
        name: f.get("name"),
        email: f.get("email"),
        subject: f.get("subject"),
        message: f.get("message"),
      });
    if (error) return setStatus("error");
    form.reset();
    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <h2>Send us a Message</h2>
      <input name="name" placeholder="Your Name" required />
      <input name="email" type="email" placeholder="Your Email" required />
      <input name="subject" placeholder="Subject" />
      <textarea name="message" placeholder="Your Message" rows={6} required />
      <button className="btn" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
      {status === "sent" && (
        <p className="ok">Message sent. We’ll get back to you soon.</p>
      )}
      {status === "error" && (
        <p className="err">Couldn’t send your message. Please try again.</p>
      )}
    </form>
  );
}
