import DeleteButton from "@/components/admin/DeleteButton";
import GalleryUpload from "@/components/admin/GalleryUpload";
import { createClient } from "@/lib/supabase/server";

export default async function AdminGallery() {
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort")
    .order("created_at", { ascending: false });
  return (
    <>
      <h2>Gallery</h2>
      <GalleryUpload />
      <h2>Uploaded photos</h2>
      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Caption</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {images?.length ? (
            images.map((g) => (
              <tr key={g.id}>
                <td>
                  <img className="thumb" src={g.url} alt="" />
                </td>
                <td>{g.caption}</td>
                <td>
                  <DeleteButton
                    table="gallery_images"
                    id={g.id}
                    label="photo"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No photos yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
