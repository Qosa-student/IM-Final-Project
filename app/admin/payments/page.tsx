import DeleteButton from "@/components/admin/DeleteButton";
import PaymentForm from "@/components/admin/PaymentForm";
import { fmtDate } from "@/lib/format";
import { getRoomName } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";

export default async function Payments() {
  const supabase = await createClient();
  const [{ data: payments }, { data: bookings }] = await Promise.all([
    supabase
      .from("payments")
      .select("*, bookings(guest_name, rooms(name))")
      .order("paid_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, guest_name, total, rooms(name)")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false }),
  ]);
  const received = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const expected = (bookings ?? []).reduce((s, b) => s + Number(b.total), 0);

  return (
    <>
      <div className="stat-grid two">
        <div className="stat">
          <span className="stat-ic">₱</span>
          <div>
            <p>Payments received</p>
            <b>₱{received.toLocaleString()}</b>
          </div>
        </div>
        <div className="stat">
          <span className="stat-ic">₱</span>
          <div>
            <p>Confirmed bookings value</p>
            <b>₱{expected.toLocaleString()}</b>
          </div>
        </div>
      </div>

      <h2>Record a payment</h2>
      <PaymentForm
        bookings={(bookings ?? []).map((b) => ({
          id: b.id,
          label: `${b.guest_name} · ${getRoomName(b.rooms) ?? "Room"} · ₱${Number(b.total).toLocaleString()}`,
        }))}
      />

      <h2>Payment history</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments?.length ? (
            payments.map((p) => (
              <tr key={p.id}>
                <td>{fmtDate(p.paid_at)}</td>
                <td>{p.bookings?.guest_name ?? "—"}</td>
                <td>{getRoomName(p.bookings?.rooms) ?? "—"}</td>
                <td style={{ textTransform: "capitalize" }}>{p.method}</td>
                <td>₱{Number(p.amount).toLocaleString()}</td>
                <td>{p.note}</td>
                <td>
                  <DeleteButton table="payments" id={p.id} label="payment" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No payments recorded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
