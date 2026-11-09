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
  const [nameMsg, setNameMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [pwMsg, setPwMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function saveName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().rpc("set_my_name", {
      new_name: String(f.get("name")),
    });
    if (error) return setNameMsg({ type: "err", text: error.message });
    setNameMsg({ type: "ok", text: "Name updated." });
    router.refresh();
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const password = String(f.get("password"));
    const confirm = String(f.get("confirm"));

    if (password.length < 6)
      return setPwMsg({
        type: "err",
        text: "Password must be at least 6 characters.",
      });
    if (password !== confirm)
      return setPwMsg({ type: "err", text: "Password do not match." });

    const { error } = await createClient().auth.updateUser({ password });
    if (error) return setPwMsg({ type: "err", text: error.message });
    form.reset();
    setPwMsg({ type: "ok", text: "Password changed." });
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
        {nameMsg && (
          <p className={nameMsg.type === "ok" ? "ok" : "err"}>{nameMsg.text}</p>
        )}
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
        <label>
          Confirm new password
          <input name="confirm" type="password" minLength={6} required />
        </label>
        <button className="btn">Change password</button>
        {pwMsg && (
          <p className={pwMsg.type === "ok" ? "ok" : "err"}>{pwMsg.text}</p>
        )}
      </form>
    </>
  );
}
