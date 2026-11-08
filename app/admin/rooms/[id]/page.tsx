import { notFound } from "next/navigation";
import RoomForm from "@/components/admin/RoomForm";
import { createClient } from "@/lib/supabase/server";

export default async function EditRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();
  if (!room) notFound();
  return (
    <>
      <h2>Edit room</h2>
      <RoomForm room={room} />
    </>
  );
}
