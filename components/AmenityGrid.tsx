import { amenityIcons, defaultAmenities } from "@/lib/amenities";
import { createClient } from "@/lib/supabase/server";

export default async function AmenityGrid() {
  let items: { name: string; icon: string }[] = defaultAmenities;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("amenities")
      .select("*")
      .order("sort")
      .order("id");
    if (data?.length) items = data;
  } catch {}

  return (
    <div className="amenities">
      {items.map((a, i) => {
        const Icon = amenityIcons[a.icon] ?? amenityIcons.palm;
        return (
          <div key={`${a.name}-${i}`} className="amenity">
            <Icon size={44} strokeWidth={1.6} />
            <span>{a.name}</span>
          </div>
        );
      })}
    </div>
  );
}
