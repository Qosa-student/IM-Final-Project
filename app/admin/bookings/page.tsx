import DeleteButton from "@/components/admin/DeleteButton";
import StatusSelect from "@/components/admin/StatusSelect";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Booking = {
  guest_name: string;
  email: string;
  check_in: string;
  check_out: string;
  status: string;
  rooms: { name: string } | null;
};

const labels: Record<string, string> = {
  pending: "Email reply",
  confirmed: "Email confirmation",
  declined: "Email decline",
  cancelled: "Email cancellation",
};

// Builds the Gmail draft. The wording depends on the booking's status.
function gmailLink(b: Booking) {
  const room = b.rooms?.name ?? "your stay";
  const dates =
    b.check_out !== b.check_in ? `${b.check_in} to ${b.check_out}` : b.check_in;

  let subject = "Your booking at D’Bay Samal";
  let body = `Hi ${b.guest_name},

Thank you for your booking request for ${room} (${dates}).

We’ll confirm availability soon.

D’Bay Samal Beach & Resort`;

  if (b.status === "confirmed") {
    subject = "Your booking is confirmed";
    body = `Hi ${b.guest_name},

Good news! Your booking for ${room} (${dates}) is confirmed.

Check-in: from 2:00 PM
Check-out: until 12:00 NN

Please bring a valid ID when you arrive.

Need to change something? Call us at 09086776094 or reply to this email.

We look forward to welcoming you!
D’Bay Samal Beach & Resort`;
  }

  if (b.status === "declined") {
    subject = "About your booking request";
    body = `Hi ${b.guest_name},

Sorry, we can’t accommodate your request for ${room} (${dates}). Please contact us at 09086776094 to find other dates.

D’Bay Samal Beach & Resort`;
  }

  if (b.status === "cancelled") {
    subject = "Your booking has been cancelled";
    body = `Hi ${b.guest_name},

Your booking for ${room} (${dates}) has been cancelled.

If this was a mistake or you’d like to book other dates, please call us at 09086776094 or reply to this email.

D’Bay Samal Beach & Resort`;
  }

  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(b.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function AdminBookings() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, rooms(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <h2>Booking requests</h2>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        Set the status first, then click the Email button. The message matches
        the status you chose.
      </p>
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
                      href={gmailLink(b as unknown as Booking)}
                    >
                      {labels[b.status] ?? "Email"}
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
