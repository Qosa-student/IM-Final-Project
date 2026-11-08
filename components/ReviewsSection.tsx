import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewsSection() {
  const supabase = await createClient();
  const [
    { data: reviews },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.auth.getUser(),
  ]);
  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  return (
    <section className="section center">
      <p className="eyebrow gold">GUEST REVIEWS</p>
      <h2>What Our Guests Say</h2>

      {reviews?.length ? (
        <div className="reviews">
          {reviews.map((r) => (
            <article key={r.id} className="review">
              <Stars n={r.rating} />
              <p>“{r.comment}”</p>
              <small>
                {r.name} · {fmtDate(r.created_at)}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ margin: "1.5rem 0" }}>
          No reviews yet. Be the first to share your stay.
        </p>
      )}

      {user ? (
        <ReviewForm userId={user.id} defaultName={profile?.full_name ?? ""} />
      ) : (
        <p>
          <Link href="/login?next=/" className="back">
            Log in to write a review
          </Link>
        </p>
      )}
    </section>
  );
}
