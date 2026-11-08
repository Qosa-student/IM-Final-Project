import PageHero from "@/components/PageHero";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Gallery | D’Bay Samal" };

export default async function Gallery() {
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort")
    .order("created_at", { ascending: false });
  return (
    <>
      <PageHero title="Gallery">
        Moments from the shores of Samal Island.
      </PageHero>
      <section className="section">
        {images?.length ? (
          <div className="gallery">
            {images.map((g) => (
              <a
                key={g.id}
                href={g.url}
                target="_blank"
                rel="noreferrer"
                className="shot"
              >
                <img
                  src={g.url}
                  alt={g.caption ?? "Resort photo"}
                  loading="lazy"
                />
                {g.caption && <span>{g.caption}</span>}
              </a>
            ))}
          </div>
        ) : (
          <p className="center">Photos are coming soon.</p>
        )}
      </section>
    </>
  );
}
