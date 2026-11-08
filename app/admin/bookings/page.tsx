import DeleteButton from "@/components/admin/DeleteButton";
import StatusSelect from "@/components/admin/StatusSelect";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBookings() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, rooms(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <h2>Booking requests</h2>
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Dates</th>
            <th>Guests</th>
            <th>Notes</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings?.length ? (
            bookings.map((b) => (
              <tr key={b.id} className={b.status === "pending" ? "unread" : ""}>
                <td>
                  {b.guest_name}
                  <br />
                  <small>
                    {b.email}
                    <br />
                    {b.phone}
                  </small>
                </td>
                <td>{b.rooms?.name ?? "Removed room"}</td>
                <td>
                  {fmtDate(b.check_in)}
                  {b.check_out !== b.check_in && (
                    <>
                      <br />→ {fmtDate(b.check_out)}
                    </>
                  )}
                </td>
                <td>{b.guests}</td>
                <td>{b.notes}</td>
                <td>
                  <StatusSelect id={b.id} status={b.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <a
                      className="btn sm outline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(b.email)}&su=${encodeURIComponent("Your booking at D’Bay Samal")}&body=${encodeURIComponent(`Hi ${b.guest_name},\n\nThank you for your booking request for ${b.rooms?.name ?? "your stay"} (${b.check_in}${b.check_out !== b.check_in ? " to " + b.check_out : ""}).\n\n`)}`}
                    >
                      Email
                    </a>
                    <DeleteButton table="bookings" id={b.id} label="booking" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No booking requests yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
