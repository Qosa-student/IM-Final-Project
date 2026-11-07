import { Ship, Footprints } from "lucide-react";
import AboutPhoto from "@/components/AboutPhoto";
import PageHero from "@/components/PageHero";

export const metadata = { title: "About Us | D’Bay Samal" };

export default function About() {
  return (
    <>
      <PageHero title="About Us" tall>
        D’Bay Resort Samal Beach &amp; Resort is a few minutes away from Port of
        Samal. Located in Caliclic, Island Garden City of Samal, this resort
        unwinds you with its beautiful scenery and relaxed atmosphere.
      </PageHero>
      <section className="section story">
        <div>
          <h2 className="accent huge">Our Story</h2>
          <p>
            Inspired by the beauty of Samal Island, D’Bay Resort was created as
            a peaceful sanctuary where guests can relax, connect, and make
            unforgettable memories.
          </p>
          <p>
            We are committed to providing genuine hospitality, comfortable
            stays, and experiences that celebrate nature at its finest.
          </p>
        </div>
        <div className="mvv">
          <div>
            <Ship />
            <h4>Our Mission</h4>
            <p>
              To provide a relaxing beachfront experience through excellent
              service and lasting memories.
            </p>
          </div>
          <div>
            <Ship />
            <h4>Our Vision</h4>
            <p>
              To be the most loved beach resort in Samal known for comfort,
              nature, and hospitality.
            </p>
          </div>
          <div>
            <Footprints />
            <h4>Our Values</h4>
            <p>
              Hospitality, Integrity, Sustainability, and Guest Satisfaction.
            </p>
          </div>
        </div>
        <AboutPhoto />
      </section>
    </>
  );
}
