import AmenityGrid from "@/components/AmenityGrid";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Amenities | D’Bay Samal" };

export default function Amenities() {
  return (
    <>
      <PageHero title="Our Amenities">
        Everything you need for a comfortable and unforgettable beach get away.
      </PageHero>
      <section className="section center">
        <AmenityGrid />
      </section>
      <section className="hero banner">
        <div className="hero-inner">
          <h2>Relax. Enjoy. Repeat</h2>
          <p>
            Experience the perfect blend of comfort, nature, and warm
            hospitality.
          </p>
        </div>
      </section>
    </>
  );
}
