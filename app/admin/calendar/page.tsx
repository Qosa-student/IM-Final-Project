import Link from "next/link";
import type { CSSProperties } from "react";
import { addDays, effEnd, iso, todayPH } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

const palette = [
  "#129aa6",
  "#4f35e8",
  "#c99a00",
  "#d6336c",
  "#2f9e44",
  "#e8590c",
  "#1971c2",
  "#862e9c",
];
const ym = (y: number, m: number) =>
  iso(new Date(Date.UTC(y, m, 1))).slice(0, 7);

export default async function BookingCalendar({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const now = new Date();
  const match = /^(\d{4})-(\d{2})$/.exec(m ?? "");
  const year = match ? +match[1] : now.getUTCFullYear();
  const month = match ? +match[2] - 1 : now.getUTCMonth();

  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = Math.ceil((first.getUTCDay() + daysInMonth) / 7);
  const gridStart = addDays(iso(first), -first.getUTCDay());
  const gridEnd = addDays(gridStart, weeks * 7);
  const thisMonth = ym(year, month);

  const supabase = await createClient();
  const [{ data: bookings }, { data: rooms }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, rooms(name)")
      .in("status", ["pending", "confirmed"])
      .lt("check_in", gridEnd)
      .gte("check_out", gridStart),
    supabase.from("rooms").select("id, name").order("sort"),
  ]);

  const color = (roomId: number) =>
    palette[
      Math.max(
        0,
        (rooms ?? []).findIndex((r) => r.id === roomId),
      ) % palette.length
    ];
  const days = Array.from({ length: weeks * 7 }, (_, i) =>
    addDays(gridStart, i),
  );
  const today = todayPH();
  const title = first.toLocaleString("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <>
      <div className="cal-head">
        <h2>{title}</h2>
        <div className="cal-nav">
          <Link
            href={`/admin/calendar?m=${ym(year, month - 1)}`}
            className="btn sm outline"
          >
            ← Prev
          </Link>
          <Link href="/admin/calendar" className="btn sm outline">
            Today
          </Link>
          <Link
            href={`/admin/calendar?m=${ym(year, month + 1)}`}
            className="btn sm outline"
          >
            Next →
          </Link>
        </div>
      </div>

      <div className="cal-legend">
        {(rooms ?? []).map((r) => (
          <span key={r.id}>
            <i style={{ "--c": color(r.id) } as CSSProperties} />
            {r.name}
          </span>
        ))}
        <span className="muted">Solid = confirmed · dashed = pending</span>
      </div>

      <div className="cal">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const here = (bookings ?? []).filter(
            (b) => b.check_in <= day && day < effEnd(b),
          );
          return (
            <div
              key={day}
              className={`cal-day ${day.slice(0, 7) === thisMonth ? "" : "out"} ${day === today ? "today" : ""}`}
            >
              <span className="cal-num">{+day.slice(8)}</span>
              {here.slice(0, 3).map((b) => (
                <Link
                  key={b.id}
                  href="/admin/bookings"
                  className={`cal-chip ${b.status}`}
                  style={{ "--c": color(b.room_id) } as CSSProperties}
                  title={`${b.guest_name} · ${b.rooms?.name ?? "Room"} · ${b.guests} guest(s) · ${b.status}`}
                >
                  {b.guest_name.split(" ")[0]} · {b.rooms?.name ?? "Room"}
                </Link>
              ))}
              {here.length > 3 && (
                <span className="cal-more">+{here.length - 3} more</span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
