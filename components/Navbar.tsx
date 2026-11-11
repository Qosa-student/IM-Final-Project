"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/rooms", label: "Rooms" },
  { href: "/gallery", label: "Gallery" },
  { href: "/amenities", label: "Amenities" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const path = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load(userId?: string) {
      setSignedIn(!!userId);
      if (!userId) return setIsAdmin(false);
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setIsAdmin(data?.role === "admin");
    }

    supabase.auth.getUser().then(({ data }) => load(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      load(s?.user?.id),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // Turns the bar solid once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <Link href="/" className="brand" aria-label="D’Bay Samal Beach & Resort">
        <img src="/images/logo.png" alt="" />
        <span className="brand-text">
          <strong>D’Bay Samal</strong>
          <small>Beach &amp; Resort</small>
        </span>
      </Link>
      <button
        className="burger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l.href) ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
        {signedIn && !isAdmin && (
          <>
            <Link
              href="/account/bookings"
              className={isActive("/account/bookings") ? "active" : ""}
            >
              My Bookings
            </Link>
            <Link
              href="/account/settings"
              className={isActive("/account/settings") ? "active" : ""}
            >
              Settings
            </Link>
          </>
        )}
        {isAdmin && <Link href="/admin">Admin</Link>}
        {signedIn ? (
          <button className="linkbtn" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link href="/login" className={path === "/login" ? "active" : ""}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
