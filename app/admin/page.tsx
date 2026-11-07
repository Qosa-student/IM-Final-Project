import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// DUMMY admin dashboard — replace with your real design later.
// Access is enforced twice: middleware.ts and the role check below (plus RLS in the database).
export default async function Admin() {
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

  const [{ data: rooms }, { data: messages }, { count: users }] =
    await Promise.all([
      supabase.from("rooms").select("*").order("sort"),
      supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="admin">
      <header>
        <h1>Admin Dashboard</h1>
        <div>
          <Link href="/" className="btn sm outline">
            View site
          </Link>{" "}
          <SignOutButton />
        </div>
      </header>
      <p>Signed in as {profile.full_name || user.email}</p>

      <div className="stats">
        <div>
          <b>{rooms?.length ?? 0}</b>Rooms &amp; cottages
        </div>
        <div>
          <b>{messages?.length ?? 0}</b>Messages
        </div>
        <div>
          <b>{users ?? 0}</b>Registered users
        </div>
      </div>

      <h2>Rooms &amp; Cottages</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Guests</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {rooms?.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.category}</td>
              <td>{r.guests}</td>
              <td>₱{Number(r.price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Latest Messages</h2>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {messages?.length ? (
            messages.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.name}
                  <br />
                  <small>{m.email}</small>
                </td>
                <td>{m.subject}</td>
                <td>{m.message}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No messages yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
