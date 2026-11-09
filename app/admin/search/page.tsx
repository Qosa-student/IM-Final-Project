import Link from "next/link";
import { getRoomName } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim().replace(/[%,()*"\\]/g, "");
  if (!term)
    return <p className="muted">Type something in the search bar above.</p>;

  const like = `%${term}%`;
  const supabase = await createClient();
  const [
    { data: bookings },
    { data: people },
    { data: messages },
    { data: rooms },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, guest_name, email, status, rooms(name)")
      .or(`guest_name.ilike.${like},email.ilike.${like}`)
      .limit(8),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .or(`full_name.ilike.${like},email.ilike.${like}`)
      .limit(8),
    supabase
      .from("messages")
      .select("id, name, subject")
      .or(`name.ilike.${like},email.ilike.${like},subject.ilike.${like}`)
      .limit(8),
    supabase
      .from("rooms")
      .select("id, name, category")
      .ilike("name", like)
      .limit(8),
  ]);

  const none =
    !bookings?.length && !people?.length && !messages?.length && !rooms?.length;

  return (
    <>
      <p className="muted">Results for “{term}”</p>
      {none && <p>Nothing found.</p>}
      {!!bookings?.length && (
        <>
          <h2>Bookings</h2>
          <ul className="results">
            {bookings.map((b) => (
              <li key={b.id}>
                <Link href="/admin/bookings">
                  {b.guest_name} · {getRoomName(b.rooms) ?? "Room"} · {b.status}
                  <small> {b.email}</small>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {!!people?.length && (
        <>
          <h2>Customers</h2>
          <ul className="results">
            {people.map((p) => (
              <li key={p.id}>
                <Link href="/admin/customers">
                  {p.full_name || "—"}
                  <small> {p.email}</small>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {!!messages?.length && (
        <>
          <h2>Messages</h2>
          <ul className="results">
            {messages.map((m) => (
              <li key={m.id}>
                <Link href="/admin/messages">
                  {m.name} · {m.subject || "No subject"}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {!!rooms?.length && (
        <>
          <h2>Rooms</h2>
          <ul className="results">
            {rooms.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/rooms/${r.id}`}>
                  {r.name} · {r.category}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
