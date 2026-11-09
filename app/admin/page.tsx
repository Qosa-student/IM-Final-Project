import Link from "next/link";
import { BedDouble, CalendarDays, Users } from "lucide-react";
import { addDays, todayPH } from "@/lib/dates";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="stat">
      <span className="stat-ic">{icon}</span>
      <div>
        <p>{label}</p>
        <b>{value}</b>
      </div>
    </div>
  );
}

type Item = {
  id: number;
  guest_name: string;
  phone: string;
  guests: number;
  rooms: { name: string } | null;
};

function Remind({
  title,
  items,
  empty,
}: {
  title: string;
  items: Item[];
  empty: string;
}) {
  return (
    <div className="remind">
      <h3>
        {title} <b>{items.length}</b>
      </h3>
      {items.length ? (
        <ul>
          {items.map((b) => (
            <li key={b.id}>
              {b.guest_name} · {b.rooms?.name ?? "Room"}
              <small>
                {b.guests} guest{b.guests === 1 ? "" : "s"} ·{" "}
                {b.phone || "no phone"}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;
  const today = todayPH();
  const tomorrow = addDays(today, 1);
  const cols =
    "id, guest_name, phone, guests, check_in, check_out, rooms(name)";

  const [
    { count: bookings },
    { count: rooms },
    { count: customers },
    { data: payments },
    { data: recent },
    { data: arrivals },
    { data: leaving },
  ] = await Promise.all([
    supabase.from("bookings").select("*", head),
    supabase.from("rooms").select("*", head),
    supabase.from("profiles").select("*", head).eq("role", "user"),
    supabase.from("payments").select("amount"),
    supabase
      .from("bookings")
      .select("*, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select(cols)
      .eq("status", "confirmed")
      .in("check_in", [today, tomorrow])
      .order("check_in"),
    supabase
      .from("bookings")
      .select(cols)
      .eq("status", "confirmed")
      .eq("check_out", today),
  ]);
  const revenue = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);

  const arrToday = (arrivals ?? []).filter(
    (b) => b.check_in === today,
  ) as unknown as Item[];
  const arrTomorrow = (arrivals ?? []).filter(
    (b) => b.check_in === tomorrow,
  ) as unknown as Item[];
  const outToday = (leaving ?? []).filter(
    (b) => b.check_out > b.check_in,
  ) as unknown as Item[];

  return (
    <>
      <div className="stat-grid">
        <Stat
          icon={<CalendarDays size={22} />}
          label="Total Bookings"
          value={bookings ?? 0}
        />
        <Stat
          icon={<BedDouble size={22} />}
          label="Total Rooms"
          value={rooms ?? 0}
        />
        <Stat
          icon={<Users size={22} />}
          label="Total Customers"
          value={customers ?? 0}
        />
        <Stat
          icon="₱"
          label="Total Revenue"
          value={`₱${revenue.toLocaleString()}`}
        />
      </div>

      <div className="reminders">
        <Remind
          title="Arriving today"
          items={arrToday}
          empty="No arrivals today."
        />
        <Remind
          title="Arriving tomorrow"
          items={arrTomorrow}
          empty="No arrivals tomorrow."
        />
        <Remind
          title="Checking out today"
          items={outToday}
          empty="No check-outs today."
        />
      </div>

      <div className="recent">
        <div className="admin-top">
          <h2>Recent bookings</h2>
          <Link href="/admin/bookings" className="btn sm outline">
            View all
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent?.length ? (
              recent.map((b) => (
                <tr key={b.id}>
                  <td>{b.guest_name}</td>
                  <td>{b.rooms?.name ?? "Removed room"}</td>
                  <td>
                    {fmtDate(b.check_in)}
                    {b.check_out !== b.check_in && ` → ${fmtDate(b.check_out)}`}
                  </td>
                  <td>
                    <span className={`status st-${b.status}`}>{b.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No bookings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
