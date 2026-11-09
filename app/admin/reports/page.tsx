import { createClient } from "@/lib/supabase/server";
import { getRoomName } from "@/lib/relations";

type Point = { label: string; value: number };

function Bars({ data, money }: { data: Point[]; money?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.label} className="bar">
          <span>{money ? `₱${d.value.toLocaleString()}` : d.value}</span>
          <div className="bar-track">
            <i style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
          <small>{d.label}</small>
        </div>
      ))}
    </div>
  );
}

function HBars({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="hbars">
      {data.map((d) => (
        <li key={d.label}>
          <span>{d.label}</span>
          <div>
            <i style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <b>{d.value}</b>
        </li>
      ))}
    </ul>
  );
}

export default async function Reports() {
  const supabase = await createClient();
  const [{ data: bookings }, { data: payments }] = await Promise.all([
    supabase.from('bookings').select('*, rooms(name)'),
    supabase.from("payments").select("amount, paid_at"),
  ]);

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      y: d.getFullYear(),
      m: d.getMonth(),
      label: d.toLocaleString("en", { month: "short" }),
      bookings: 0,
      revenue: 0,
    };
  });
  const slot = (iso: string) => {
    const d = new Date(iso);
    return months.find((x) => x.y === d.getFullYear() && x.m === d.getMonth());
  };
  bookings?.forEach((b) => {
    const s = slot(b.created_at);
    if (s) s.bookings++;
  });
  payments?.forEach((p) => {
    const s = slot(p.paid_at);
    if (s) s.revenue += Number(p.amount);
  });

  const statuses = ["pending", "confirmed", "declined", "cancelled"].map(
    (s) => ({
      label: s[0].toUpperCase() + s.slice(1),
      value: bookings?.filter((b) => b.status === s).length ?? 0,
    }),
  );

  const byRoom: Record<string, number> = {};
  bookings?.forEach((b) => {
    const n = getRoomName(b.rooms) ?? "Removed room";
    byRoom[n] = (byRoom[n] ?? 0) + 1;
  });
  const topRooms = Object.entries(byRoom)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="chart-grid">
      <div className="chart">
        <h3>Bookings (last 6 months)</h3>
        <Bars
          data={months.map((m) => ({ label: m.label, value: m.bookings }))}
        />
      </div>
      <div className="chart">
        <h3>Revenue received (last 6 months)</h3>
        <Bars
          money
          data={months.map((m) => ({ label: m.label, value: m.revenue }))}
        />
      </div>
      <div className="chart">
        <h3>Bookings by status</h3>
        <HBars data={statuses} />
      </div>
      <div className="chart">
        <h3>Most booked rooms</h3>
        {topRooms.length ? (
          <HBars data={topRooms} />
        ) : (
          <p className="muted">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
