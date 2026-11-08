"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReadToggle({
  id,
  isRead,
}: {
  id: number;
  isRead: boolean;
}) {
  const router = useRouter();
  async function toggle() {
    const { error } = await createClient()
      .from("messages")
      .update({ is_read: !isRead })
      .eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }
  return (
    <button className="btn sm outline" onClick={toggle}>
      {isRead ? "Mark unread" : "Mark read"}
    </button>
  );
}
