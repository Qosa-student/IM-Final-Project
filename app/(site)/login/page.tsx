"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PageHero from "@/components/PageHero";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

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
      setBusy(false);
      if (error) return setMsg({ type: "err", text: error.message });
      if (!data.session)
        return setMsg({
          type: "ok",
          text: "Account created. Check your email to confirm, then log in.",
        });
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

    // Same form for everyone — role decides where you land.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();
    router.push(profile?.role === "admin" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <>
      <PageHero title={mode === "login" ? "Welcome Back" : "Create Account"}>
        Log in to your D’Bay Samal account.
      </PageHero>
      <section className="section">
        <form onSubmit={onSubmit} className="form auth">
          <h2>{mode === "login" ? "Log in" : "Sign up"}</h2>
          {mode === "signup" && (
            <input name="name" placeholder="Full Name" required />
          )}
          <input name="email" type="email" placeholder="Email" required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            minLength={6}
            required
          />
          <button className="btn" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
          {msg && <p className={msg.type}>{msg.text}</p>}
          <button
            type="button"
            className="linkbtn dark"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMsg(null);
            }}
          >
            {mode === "login"
              ? "No account yet? Sign up"
              : "Already have an account? Log in"}
          </button>
        </form>
      </section>
    </>
  );
}
