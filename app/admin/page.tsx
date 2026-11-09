import Link from "next/link";
import { BedDouble, CalendarDays, Users } from "lucide-react";
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

export default async function Dashboard() {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;
  const [
    { count: bookings },
    { count: rooms },
    { count: customers },
    { data: payments },
    { data: recent },
  ] = await Promise.all([
    supabase.from("bookings").select("*", head),
    supabase.from("rooms").select("*", head),
    supabase.from("profiles").select("*", head).eq("role", "user"),
    supabase.from("payments").select("amount"),
    supabase
      .from("bookings")
      .select("id, guest_name, check_in, check_out, status, rooms(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const revenue = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);

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
