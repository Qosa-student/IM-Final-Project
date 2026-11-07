import { User, BedDouble, Maximize, Table, Armchair } from "lucide-react";
import type { Room } from "@/lib/types";

export default function RoomCard({ room }: { room: Room }) {
  const isRoom = room.category === "room";
  return (
    <article className="card">
      <div className="card-img">
        {room.image && (
          <img src={`/images/rooms/${room.image}`} alt={room.name} />
        )}
      </div>
      <div className="card-body">
        <h3>{room.name}</h3>
        <ul className="specs">
          <li>
            <User size={22} /> {room.guests} Guests
          </li>
          {isRoom ? (
            <>
              <li>
                <BedDouble size={22} /> {room.beds}{" "}
                {room.beds === 1 ? "Bed" : "Beds"}
              </li>
              <li>
                <Maximize size={22} /> {room.size_sqm}m²
              </li>
            </>
          ) : (
            <>
              <li>
                <Table size={22} /> {room.tables_count} Tables
              </li>
              <li>
                <Armchair size={22} /> {room.chairs} Chairs
              </li>
            </>
          )}
        </ul>
        <p className="price">
          ₱{Number(room.price).toLocaleString()}
          {isRoom && <span> /night</span>}
        </p>
        <a href="/contact" className="btn">
          View Details
        </a>
      </div>
    </article>
  );
}
