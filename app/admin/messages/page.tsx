import DeleteButton from "@/components/admin/DeleteButton";
import ReadToggle from "@/components/admin/ReadToggle";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMessages() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    <>
      <h2>Messages</h2>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {messages?.length ? (
            messages.map((m) => (
              <tr key={m.id} className={m.is_read ? "read-row" : "unread"}>
                <td>
                  {m.is_read ? (
                    <span className="badge read">✓ Read</span>
                  ) : (
                    <span className="badge">New</span>
                  )}{" "}
                  {m.name}
                  <br />
                  <small>{m.email}</small>
                </td>
                <td>{m.subject}</td>
                <td>{m.message}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="row-actions">
                    <a
                      className="btn sm outline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(m.email)}&su=${encodeURIComponent("Re: " + (m.subject ?? ""))}`}
                    >
                      Reply
                    </a>
                    <ReadToggle id={m.id} isRead={m.is_read} />
                    <DeleteButton table="messages" id={m.id} label="message" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No messages yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
