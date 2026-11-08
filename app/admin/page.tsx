import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const [
    { count: rooms },
    { count: unread },
    { count: users },
    { data: latest },
  ] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <>
      <p>Signed in as {profile.full_name || user.email}</p>
      <div className="stats">
        <Link href="/admin/rooms">
          <b>{rooms ?? 0}</b>Rooms &amp; cottages
        </Link>
        <Link href="/admin/messages">
          <b>{unread ?? 0}</b>Unread messages
        </Link>
        <div>
          <b>{users ?? 0}</b>Registered users
        </div>
      </div>
      <h2>Latest messages</h2>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>Subject</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {latest?.length ? (
            latest.map((m) => (
              <tr key={m.id} className={m.is_read ? "" : "unread"}>
                <td>
                  {m.name}
                  <br />
                  <small>{m.email}</small>
                </td>
                <td>{m.subject}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No messages yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
