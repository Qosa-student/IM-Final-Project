import Link from "next/link";
import { Phone, Mail, MapPin, TreePalm } from "lucide-react";
import AboutPhoto from "@/components/AboutPhoto";
import AmenityGrid from "@/components/AmenityGrid";
import RoomCard from "@/components/RoomCard";
import { getRooms } from "@/lib/rooms";
import ReviewsSection from "@/components/ReviewsSection";
import JsonLd from "@/components/JsonLd";

export default async function Home() {
  const rooms = await getRooms(2);
  return (
    <>
      <JsonLd />
      <section className="hero home">
        <div className="hero-inner">
          <p className="kicker">Welcome to Paradise</p>
          <h1>
            Relax. Unwind.
            <br />
            Live the Beach Life.
          </h1>
          <p>
            Experience the perfect blend of comfort and nature at D’Bay Samal
            Beach &amp; Resort. Your dream beach escape awaits.
          </p>
        </div>
      </section>

      <section className="section about">
        <div>
          <p className="eyebrow">ABOUT D’BAY SAMAL</p>
          <h2 className="accent">A Slice of Paradise</h2>
          <p>
            D’Bay Resort Samal Beach &amp; Resort is a few minutes away from
            Port of Samal. Located in Caliclic, Island Garden City of Samal,
            this resort unwinds you with its beautiful scenery and relaxed
            atmosphere.
          </p>
          <p className="tag">
            <TreePalm size={36} /> Serene place, Perfect escape.
          </p>
        </div>
        <AboutPhoto />
      </section>

      <section className="section center">
        <p className="eyebrow dark">OUR ROOMS</p>
        <h2 className="accent serif-b">Comfortable Stays for Everyone</h2>
        <div className="wave" />
        <div className="grid two">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
        <Link href="/rooms" className="btn outline big">
          View All Rooms
        </Link>
      </section>

      <section className="section center">
        <p className="eyebrow gold">RESORT AMENITIES</p>
        <h2>Everything You Need</h2>
        <AmenityGrid />
      </section>

      <ReviewsSection />

      <section className="contact-strip">
        <h3>Contact Us</h3>
        <p>
          <Phone /> 09086776094
        </p>
        <p>
          <Mail /> info@dbaysamal.com
        </p>
        <p>
          <MapPin /> Purok 7 Caliclic, Babak 8000
          <br />
          Samal, Philippines
        </p>
      </section>
    </>
  );
}
