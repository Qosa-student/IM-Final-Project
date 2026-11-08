"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StatusSelect({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();
  async function change(value: string) {
    const { error } = await createClient()
      .from("bookings")
      .update({ status: value })
      .eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }
  return (
    <select
      className={`status st-${status}`}
      value={status}
      onChange={(e) => change(e.target.value)}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="declined">Declined</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
