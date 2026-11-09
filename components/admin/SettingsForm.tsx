"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsForm({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  async function saveName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().rpc("set_my_name", {
      new_name: String(f.get("name")),
    });
    if (error) return setMsg({ type: "err", text: error.message });
    setMsg({ type: "ok", text: "Name updated." });
    router.refresh();
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password"));
    if (password.length < 6)
      return setMsg({
        type: "err",
        text: "Password must be at least 6 characters.",
      });
    const { error } = await createClient().auth.updateUser({ password });
    if (error) return setMsg({ type: "err", text: error.message });
    form.reset();
    setMsg({ type: "ok", text: "Password changed." });
  }

  return (
    <>
      <form onSubmit={saveName} className="form admin-form">
        <label>
          Email
          <input value={email} disabled readOnly />
        </label>
        <label>
          Display name
          <input name="name" defaultValue={name} required />
        </label>
        <button className="btn">Save name</button>
      </form>
      <form
        onSubmit={savePassword}
        className="form admin-form"
        style={{ marginTop: "2rem" }}
      >
        <label>
          New password
          <input name="password" type="password" minLength={6} required />
        </label>
        <button className="btn">Change password</button>
      </form>
      {msg && (
        <p
          className={msg.type === "ok" ? "ok" : "err"}
          style={{ marginTop: "1rem" }}
        >
          {msg.text}
        </p>
      )}
    </>
  );
}
