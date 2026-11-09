import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function Customers() {
  const supabase = await createClient();
  const [{ data: people }, { data: bookings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("bookings").select("user_id"),
  ]);
  const counts: Record<string, number> = {};
  bookings?.forEach((b) => {
    counts[b.user_id] = (counts[b.user_id] ?? 0) + 1;
  });

  return (
    <>
      <h2>Customers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          {people?.length ? (
            people.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name || "—"}</td>
                <td>{p.email}</td>
                <td>
                  <span
                    className={`status ${p.role === "admin" ? "st-confirmed" : "st-cancelled"}`}
                  >
                    {p.role}
                  </span>
                </td>
                <td>{fmtDate(p.created_at)}</td>
                <td>{counts[p.id] ?? 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No customers yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
