"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, LogIn, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(
    null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")),
      password = String(f.get("password"));
    const supabase = createClient();
    setBusy(true);
    setMsg(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: String(f.get("name")) } },
      });
      if (error) {
        setBusy(false);
        return setMsg({ type: "err", text: error.message });
      }
      if (!data.session) {
        setBusy(false);
        return setMsg({
          type: "ok",
          text: "Account created. Check your email to confirm, then sign in.",
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setBusy(false);
        return setMsg({ type: "err", text: error.message });
      }
    }

    // One form for everyone: the role decides where you land.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();
    const target =
      profile?.role === "admin"
        ? next.startsWith("/admin")
          ? next
          : "/admin"
        : next && !next.startsWith("/admin")
          ? next
          : "/";
    router.push(target);
    router.refresh();
  }

  return (
    <>
      <h1 className="lp-pill">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>
      <p className="lp-sub">
        {mode === "login"
          ? "Welcome back! Please sign in to continue."
          : "Create an account to book your stay."}
      </p>

      <form onSubmit={onSubmit} className="lp-form">
        {mode === "signup" && (
          <label className="lp-field">
            <User size={20} />
            <input name="name" placeholder="Full Name" required />
          </label>
        )}
        <label className="lp-field">
          <Mail size={20} />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            required
          />
        </label>
        <label className="lp-field">
          <Lock size={20} />
          <input
            name="password"
            type={show ? "text" : "password"}
            placeholder="Password"
            minLength={6}
            required
          />
          <button
            type="button"
            className="lp-eye"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </label>
        <button className="lp-submit" disabled={busy}>
          <LogIn size={20} />
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Sign In"
              : "Create account"}
        </button>
        {msg && <p className={`lp-msg ${msg.type}`}>{msg.text}</p>}
      </form>

      <button
        type="button"
        className="lp-toggle"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setMsg(null);
        }}
      >
        {mode === "login"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </>
  );
}
