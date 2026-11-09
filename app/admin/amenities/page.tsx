import AmenityForm from "@/components/admin/AmenityForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { amenityIcons } from "@/lib/amenities";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAmenities() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("amenities")
    .select("*")
    .order("sort")
    .order("id");

  return (
    <>
      <h2>Add an amenity</h2>
      <AmenityForm />
      <h2>Current amenities</h2>
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items?.length ? (
            items.map((a) => {
              const Icon = amenityIcons[a.icon] ?? amenityIcons.palm;
              return (
                <tr key={a.id}>
                  <td>
                    <Icon size={26} />
                  </td>
                  <td>{a.name}</td>
                  <td>
                    <DeleteButton table="amenities" id={a.id} label="amenity" />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3}>No amenities yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
