"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ApproveToggle({
  id,
  approved,
}: {
  id: number;
  approved: boolean;
}) {
  const router = useRouter();
  async function toggle() {
    const { error } = await createClient()
      .from("reviews")
      .update({ approved: !approved })
      .eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }
  return (
    <button className="btn sm outline" onClick={toggle}>
      {approved ? "Hide" : "Approve"}
    </button>
  );
}
