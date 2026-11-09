import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sign in | D’Bay Samal" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "";

  // Already signed in? Send them where they belong.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    redirect(
      p?.role === "admin"
        ? "/admin"
        : safeNext && !safeNext.startsWith("/admin")
          ? safeNext
          : "/",
    );
  }

  return (
    <div className="login-page">
      <section className="login-art">
        <div>
          <img src="/images/logo.png" alt="" className="la-logo" />
          <h2 className="la-name">D’Bay Samal</h2>
          <p className="la-sub">Beach &amp; Resort</p>
          <hr />
          <p className="la-tag">Relax · Unwind · Enjoy</p>
        </div>
      </section>

      <section className="login-panel">
        <svg
          className="login-wave"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,0 C55,18 78,28 52,48 C28,66 82,78 0,100 L100,100 L100,0 Z" />
        </svg>
        <img src="/images/logo.png" alt="" className="lp-logo" />
        <h2 className="lp-name">D’Bay Samal</h2>
        <p className="lp-brand-sub">Beach &amp; Resort</p>
        <LoginForm next={safeNext} />
      </section>
    </div>
  );
}
