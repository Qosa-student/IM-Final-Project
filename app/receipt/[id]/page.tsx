import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function Receipt({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/receipt/${id}`);

  const { data: b } = await supabase
    .from("bookings")
    .select("*, rooms(name, price, category)")
    .eq("id", id)
    .single();
  if (!b) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const back =
    profile?.role === "admin" ? "/admin/bookings" : "/account/bookings";

  if (b.status !== "confirmed") {
    return (
      <div className="receipt-wrap">
        <p>A receipt is only available for confirmed bookings.</p>
        <Link href={back} className="back">
          ← Back
        </Link>
      </div>
    );
  }

  const { data: paidRaw } = await supabase.rpc("booking_paid", {
    p_booking: b.id,
  });
  const paid = Number(paidRaw ?? 0);
  const total = Number(b.total);
  const balance = Math.max(total - paid, 0);
  const isRoom = b.rooms?.category === "room";
  const count = Math.max(
    Math.round((+new Date(b.check_out) - +new Date(b.check_in)) / 86400000),
    1,
  );
  const unit = isRoom ? "night" : "day";
  const number = `DBS-${String(b.id).padStart(5, "0")}`;
  const issued = new Date().toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });

  return (
    <div className="receipt-wrap">
      <div className="rc-actions no-print">
        <Link href={back} className="btn outline">
          ← Back
        </Link>
        <PrintButton />
      </div>

      <article className="receipt">
        <header className="rc-head">
          <img src="/images/logo.png" alt="" />
          <div>
            <strong>D’Bay Samal</strong>
            <small>
              Beach &amp; Resort · Purok 7 Caliclic, Babak 8000, Samal,
              Philippines · 09086776094
            </small>
          </div>
        </header>

        <div className="rc-meta">
          <span>
            <b>Receipt no.</b> {number}
          </span>
          <span>
            <b>Issued</b> {issued}
          </span>
        </div>

        <p>
          <b>Guest:</b> {b.guest_name}
          {b.email && ` · ${b.email}`}
        </p>

        <table className="rc-table">
          <tbody>
            <tr>
              <td>Room / cottage</td>
              <td>{b.rooms?.name ?? "Removed room"}</td>
            </tr>
            <tr>
              <td>Check-in</td>
              <td>{fmtDate(b.check_in)}</td>
            </tr>
            <tr>
              <td>Check-out</td>
              <td>{fmtDate(b.check_out)}</td>
            </tr>
            <tr>
              <td>{isRoom ? "Nights" : "Days"}</td>
              <td>{count}</td>
            </tr>
            <tr>
              <td>Guests</td>
              <td>{b.guests}</td>
            </tr>
            <tr>
              <td>Rate per {unit}</td>
              <td>₱{Number(b.rooms?.price ?? 0).toLocaleString()}</td>
            </tr>
            <tr className="rc-total">
              <td>Total</td>
              <td>₱{total.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Paid</td>
              <td>₱{paid.toLocaleString()}</td>
            </tr>
            <tr className="rc-total">
              <td>Balance due</td>
              <td>
                {balance > 0 ? `₱${balance.toLocaleString()}` : "Paid in full"}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="muted">
          Check-in from 2:00 PM · Check-out until 12:00 NN · Please bring a
          valid ID. Thank you for choosing D’Bay Samal Beach &amp; Resort!
        </p>
      </article>
    </div>
  );
}
