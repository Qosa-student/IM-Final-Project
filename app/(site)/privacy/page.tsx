import PageHero from "@/components/PageHero";

export const metadata = { title: "Privacy Policy | D’Bay Samal" };

export default function Privacy() {
  return (
    <>
      <PageHero title="Privacy Policy">
        How we handle your personal information.
      </PageHero>
      <section className="section">
        <div className="legal">
          <p className="muted">Last updated: November 2026</p>

          <h2>1. What we collect</h2>
          <p>
            When you create an account, send a message, request a booking or
            write a review, we collect your name, email address, phone number
            (for bookings), booking details and the text you send us.
          </p>

          <h2>2. How we use it</h2>
          <p>
            We use your information to answer your messages, manage your booking
            requests, contact you about your stay and show approved reviews on
            our website. We do not sell your information.
          </p>

          <h2>3. Where it is stored</h2>
          <p>
            Your data is stored with our service provider, Supabase. Access is
            limited to our staff, and passwords are never visible to us.
          </p>

          <h2>4. Reviews</h2>
          <p>
            If you submit a review, your name and comment may be shown publicly
            once approved.
          </p>

          <h2>5. Your rights</h2>
          <p>
            Under the Philippine Data Privacy Act of 2012, you may ask to see,
            correct or delete the personal information we hold about you, or
            withdraw your consent to its use.
          </p>

          <h2>6. Contact</h2>
          <p>
            To make a request, email{" "}
            <a href="mailto:info@dbaysamal.com">info@dbaysamal.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
