"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type Counts = { messages: number; bookings: number; reviews: number };

export default function NotificationBell({ initial }: { initial: Counts }) {
  const router = useRouter();
  const [c, setC] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function refresh() {
      const head = { count: "exact", head: true } as const;
      const [m, b, r] = await Promise.all([
        supabase.from("messages").select("*", head).eq("is_read", false),
        supabase.from("bookings").select("*", head).eq("status", "pending"),
        supabase.from("reviews").select("*", head).eq("approved", false),
      ]);
      setC({
        messages: m.count ?? 0,
        bookings: b.count ?? 0,
        reviews: r.count ?? 0,
      });
      router.refresh(); // updates whatever admin page is open
    }

    const channel = supabase.channel("admin-live");
    for (const table of ["messages", "bookings", "reviews"]) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refresh,
      );
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const total = c.messages + c.bookings + c.reviews;
  const rows = [
    {
      href: "/admin/messages",
      n: c.messages,
      one: "unread message",
      many: "unread messages",
    },
    {
      href: "/admin/bookings",
      n: c.bookings,
      one: "pending booking",
      many: "pending bookings",
    },
    {
      href: "/admin/reviews",
      n: c.reviews,
      one: "review to approve",
      many: "reviews to approve",
    },
  ].filter((r) => r.n > 0);

  return (
    <div className="bell" ref={ref}>
      <button
        className="bell-btn"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications (${total})`}
        aria-expanded={open}
      >
        <Bell size={22} />
        {total > 0 && (
          <span className="bell-badge">{total > 9 ? "9+" : total}</span>
        )}
      </button>
      {open && (
        <div className="drop" onClick={() => setOpen(false)}>
          {rows.length ? (
            rows.map((r) => (
              <Link key={r.href} href={r.href}>
                {r.n} {r.n === 1 ? r.one : r.many}
              </Link>
            ))
          ) : (
            <p className="drop-empty">You’re all caught up.</p>
          )}
        </div>
      )}
    </div>
  );
}
