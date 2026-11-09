"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ChevronDown,
  House,
  Images,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Star,
  Umbrella,
  Users,
  Wallet,
} from "lucide-react";
import NotificationBell, {
  type Counts,
} from "@/components/admin/NotificationBell";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/admin", label: "Dashboard", icon: House },
  { href: "/admin/bookings", label: "Booking Management", icon: CalendarDays },
  { href: "/admin/rooms", label: "Room Management", icon: BedDouble },
  { href: "/admin/customers", label: "Customer Management", icon: Users },
  { href: "/admin/payments", label: "Payment Management", icon: Wallet },
  { href: "/admin/amenities", label: "Amenities Management", icon: Umbrella },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({
  name,
  initial,
  children,
}: {
  name: string;
  initial: Counts;
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  const isActive = (href: string) =>
    href === "/admin" ? path === "/admin" : path.startsWith(href);
  const isDash = path === "/admin";
  const current = nav.find(
    (n) => n.href !== "/admin" && path.startsWith(n.href),
  );
  const title = isDash
    ? `Welcome back, ${name}!`
    : path.startsWith("/admin/search")
      ? "Search results"
      : (current?.label ?? "Admin");

  return (
    <div className="admin-shell">
      <aside className={`admin-side ${open ? "open" : ""}`}>
        <div className="side-brand">
          <img src="/images/logo.png" alt="" />
          <strong>D’Bay Samal</strong>
          <span>Beach &amp; Resort</span>
        </div>
        <nav>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={isActive(href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <button className="side-logout" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
        <div className="side-wave" aria-hidden="true" />
      </aside>

      <div className="admin-body">
        <header className="topbar">
          <button
            className="side-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <div className="top-title">
            <h1>{title}</h1>
            {isDash && <p>Manage your resort with ease and comfort.</p>}
          </div>
          <form action="/admin/search" className="top-search" role="search">
            <Search size={18} />
            <input
              name="q"
              placeholder="Search anything..."
              aria-label="Search"
            />
          </form>
          <NotificationBell initial={initial} />
          <div className="profile" ref={menuRef}>
            <button
              className="profile-btn"
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
            >
              <span className="avatar">{name.charAt(0).toUpperCase()}</span>
              <span className="profile-name">{name}</span>
              <ChevronDown size={16} />
            </button>
            {menu && (
              <div className="drop" onClick={() => setMenu(false)}>
                <Link href="/admin/settings">Settings</Link>
                <Link href="/">View website</Link>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        <section className={`admin admin-content ${isDash ? "dash" : "panel"}`}>
          {children}
        </section>
      </div>
    </div>
  );
}
