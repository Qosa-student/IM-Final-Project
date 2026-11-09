"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Msg = { type: "ok" | "err"; text: string } | null;

export default function UserSettingsForm({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const router = useRouter();
  const [nameMsg, setNameMsg] = useState<Msg>(null);
  const [emailMsg, setEmailMsg] = useState<Msg>(null);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  async function saveName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().rpc("set_my_name", {
      new_name: String(f.get("name")).trim(),
    });
    if (error) return setNameMsg({ type: "err", text: error.message });
    setNameMsg({ type: "ok", text: "Name updated." });
    router.refresh();
  }

  async function saveEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const newEmail = String(f.get("email")).trim();
    if (newEmail.toLowerCase() === email.toLowerCase())
      return setEmailMsg({ type: "err", text: "That is already your email." });

    const { data, error } = await createClient().auth.updateUser({
      email: newEmail,
    });
    if (error) return setEmailMsg({ type: "err", text: error.message });

    if (data.user?.email?.toLowerCase() === newEmail.toLowerCase()) {
      setEmailMsg({ type: "ok", text: "Email updated." });
      router.refresh();
    } else {
      setEmailMsg({
        type: "ok",
        text: `We sent a confirmation link to ${newEmail}. Your email changes once you confirm it.`,
      });
    }
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const password = String(f.get("password"));

    if (password.length < 6)
      return setPwMsg({
        type: "err",
        text: "Password must be at least 6 characters.",
      });
    if (password !== String(f.get("confirm")))
      return setPwMsg({ type: "err", text: "Passwords do not match." });

    const { error } = await createClient().auth.updateUser({ password });
    if (error) return setPwMsg({ type: "err", text: error.message });
    form.reset();
    setPwMsg({ type: "ok", text: "Password changed." });
  }

  const show = (m: Msg) =>
    m && <p className={m.type === "ok" ? "ok" : "err"}>{m.text}</p>;

  return (
    <div className="acct">
      <form onSubmit={saveName} className="form admin-form">
        <h3>Name</h3>
        <label>
          Display name
          <input name="name" defaultValue={name} required />
        </label>
        <button className="btn">Save name</button>
        {show(nameMsg)}
      </form>

      <form onSubmit={saveEmail} className="form admin-form">
        <h3>Email</h3>
        <label>
          Email address
          <input name="email" type="email" defaultValue={email} required />
        </label>
        <button className="btn">Save email</button>
        {show(emailMsg)}
      </form>

      <form onSubmit={savePassword} className="form admin-form">
        <h3>Password</h3>
        <label>
          New password
          <input name="password" type="password" minLength={6} required />
        </label>
        <label>
          Confirm new password
          <input name="confirm" type="password" minLength={6} required />
        </label>
        <button className="btn">Change password</button>
        {show(pwMsg)}
      </form>
    </div>
  );
}
