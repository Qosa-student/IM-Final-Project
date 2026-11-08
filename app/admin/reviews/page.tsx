import ApproveToggle from "@/components/admin/ApproveToggle";
import DeleteButton from "@/components/admin/DeleteButton";
import Stars from "@/components/Stars";
import { fmtDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReviews() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("approved")
    .order("created_at", { ascending: false });

  return (
    <>
      <h2>Guest reviews</h2>
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reviews?.length ? (
            reviews.map((r) => (
              <tr key={r.id} className={r.approved ? "" : "unread"}>
                <td>{r.name}</td>
                <td>
                  <Stars n={r.rating} />
                </td>
                <td>{r.comment}</td>
                <td>{fmtDate(r.created_at)}</td>
                <td>
                  <span
                    className={`status ${r.approved ? "st-confirmed" : "st-pending"}`}
                  >
                    {r.approved ? "Shown" : "Pending"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <ApproveToggle id={r.id} approved={r.approved} />
                    <DeleteButton table="reviews" id={r.id} label="review" />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No reviews yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
