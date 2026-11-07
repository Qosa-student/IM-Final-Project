import PageHero from "@/components/PageHero";
import RoomCard from "@/components/RoomCard";
import { getRooms } from "@/lib/rooms";

export const metadata = { title: "Rooms | D’Bay Samal" };

export default async function Rooms() {
  const rooms = await getRooms();
  return (
    <>
      <PageHero title="Our Rooms">
        Comfortable stays for every kind of traveler.
        <br />
        Relax and enjoy the beauty of Samal Island
      </PageHero>
      <section className="section">
        <div className="grid three">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      </section>
    </>
  );
}
