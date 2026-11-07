import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Contact | D’Bay Samal" };

export default function Contact() {
  return (
    <>
      <PageHero title="Contact Us">
        We’d love to hear from you!
        <br />
        Reach out to us for inquiries, reservations, or any other concerns.
      </PageHero>
      <section className="section contact">
        <aside className="touch">
          <h2>Get in Touch</h2>
          <p>
            <Phone />
            <span>
              <small>Phone</small>09086676094
            </span>
          </p>
          <p>
            <Mail />
            <span>
              <small>Email</small>info@dbaysamal.com
            </span>
          </p>
          <p>
            <MapPin />
            <span>
              <small>Address</small>Purok 7 Caliclic, Babak 8000
              <br />
              Samal, Philippines
            </span>
          </p>
          <h2>Follow Us</h2>
          <div className="social dark">
            <a href="#" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram />
            </a>
          </div>
        </aside>
        <ContactForm />
      </section>
    </>
  );
}
