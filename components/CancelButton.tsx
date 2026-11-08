"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CancelButton({ id }: { id: number }) {
  const router = useRouter();
  async function cancel() {
    if (!confirm("Cancel this booking request?")) return;
    const { error } = await createClient()
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }
  return (
    <button className="btn sm danger" onClick={cancel}>
      Cancel request
    </button>
  );
}
