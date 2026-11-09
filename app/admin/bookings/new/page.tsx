import WalkInForm from "@/components/admin/WalkInForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewWalkIn() {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, category, guests, price")
    .order("sort");
  return (
    <>
      <h2>Walk-in booking</h2>
      <p className="muted">
        For guests who book by phone or in person. The booking is saved straight
        away, and you can record a payment at the same time.
      </p>
      <WalkInForm rooms={rooms ?? []} />
    </>
  );
}
