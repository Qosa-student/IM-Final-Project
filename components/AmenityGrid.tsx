import {
  Snowflake,
  Sunset,
  House,
  Beer,
  Mic,
  CookingPot,
  Flame,
} from "lucide-react";

const items = [
  { icon: Snowflake, label: "Air-conditioned Rooms" },
  { icon: Sunset, label: "Great View of Sunset" },
  { icon: House, label: "Open Cottages" },
  { icon: Beer, label: "Mini Bar" },
  { icon: Mic, label: "Karaoke Room" },
  { icon: CookingPot, label: "Kitchen" },
  { icon: Flame, label: "Grill" },
];

export default function AmenityGrid() {
  return (
    <div className="amenities">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="amenity">
          <Icon size={44} strokeWidth={1.6} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
