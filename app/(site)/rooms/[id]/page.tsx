import Link from "next/link";
import { notFound } from "next/navigation";
import { User, BedDouble, Maximize, Table, Armchair } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import PageHero from "@/components/PageHero";
import { roomImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/server";

export default async function RoomDetails({
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  const isRoom = room.category === "room";
  const src = roomImage(room.image);

  return (
    <>
      <PageHero title={room.name}>
        {isRoom ? "Room" : "Cottage"} · up to {room.guests} guests
      </PageHero>
      <section className="section">
        <div className="detail">
          <div>
            {src ? (
              <img className="detail-img" src={src} alt={room.name} />
            ) : (
              <div className="ph detail-img">{room.name}</div>
            )}
            <ul className="specs">
              <li>
                <User size={20} /> {room.guests} Guests
              </li>
              {isRoom ? (
                <>
                  <li>
                    <BedDouble size={20} /> {room.beds}{" "}
                    {room.beds === 1 ? "Bed" : "Beds"}
                  </li>
                  <li>
                    <Maximize size={20} /> {room.size_sqm}m²
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Table size={20} /> {room.tables_count} Tables
                  </li>
                  <li>
                    <Armchair size={20} /> {room.chairs} Chairs
                  </li>
                </>
              )}
            </ul>
            <p className="price">
              ₱{Number(room.price).toLocaleString()}
              {isRoom && <span> /night</span>}
            </p>
            {room.description && <p className="desc">{room.description}</p>}
            <Link href="/rooms" className="back">
              ← Back to all rooms
            </Link>
          </div>

          <div className="book">
            <h3>Request a booking</h3>
            {user ? (
              <BookingForm
                room={room}
                userId={user.id}
                defaultName={profile?.full_name ?? ""}
                defaultEmail={user.email ?? ""}
              />
            ) : (
              <>
                <p>Log in or create an account to send a booking request.</p>
                <Link href={`/login?next=/rooms/${room.id}`} className="btn">
                  Log in to book
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
