"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteButton({
  table,
  id,
  label,
}: {
  table: "rooms" | "messages" | "bookings" | "gallery_images" | "reviews";
  id: number;
  label: string;
}) {
  const router = useRouter();
  async function remove() {
    if (!confirm(`Delete this ${label}? This can't be undone.`)) return;
    const { error } = await createClient().from(table).delete().eq("id", id);
    if (error) return alert(error.message);
    router.refresh();
  }
  return (
    <button className="btn sm danger" onClick={remove}>
      Delete
    </button>
  );
}
