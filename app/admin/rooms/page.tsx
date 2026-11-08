import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { roomImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRooms() {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("sort");
  return (
    <>
      <div className="admin-top">
        <h2>Rooms &amp; Cottages</h2>
        <Link href="/admin/rooms/new" className="btn sm">
          + Add room
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Type</th>
            <th>Guests</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms?.map((r) => {
            const src = roomImage(r.image);
            return (
              <tr key={r.id}>
                <td>
                  {src ? (
                    <img className="thumb" src={src} alt="" />
                  ) : (
                    <div className="thumb" />
                  )}
                </td>
                <td>{r.name}</td>
                <td>{r.category}</td>
                <td>{r.guests}</td>
                <td>₱{Number(r.price).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <Link
                      href={`/admin/rooms/${r.id}`}
                      className="btn sm outline"
                    >
                      Edit
                    </Link>
                    <DeleteButton table="rooms" id={r.id} label="room" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
