import Link from "next/link";
import { redirect } from "next/navigation";
import CancelButton from "@/components/CancelButton";
import PageHero from "@/components/PageHero";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function MyBookings({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/bookings");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, rooms(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHero title="My Bookings">
        Track your booking requests and their status.
      </PageHero>
      <section className="section">
        <div className="bk">
          {sent && (
            <p className="notice">
              Request sent! We’ll confirm it by email or phone soon.
            </p>
          )}
          {bookings?.length ? (
            bookings.map((b) => (
              <article key={b.id} className="bk-item">
                <div>
                  <h3>{b.rooms?.name ?? "Removed room"}</h3>
                  <p>
                    {fmtDate(b.check_in)}
                    {b.check_out !== b.check_in &&
                      ` → ${fmtDate(b.check_out)}`}{" "}
                    · {b.guests} guest{b.guests === 1 ? "" : "s"}
                  </p>
                  {b.notes && <small className="muted">“{b.notes}”</small>}
                </div>
                <div className="bk-side">
                  <span className={`status st-${b.status}`}>{b.status}</span>
                  {b.status === "pending" && <CancelButton id={b.id} />}
                </div>
              </article>
            ))
          ) : (
            <p>
              No bookings yet.{" "}
              <Link href="/rooms" className="back">
                Browse rooms →
              </Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
