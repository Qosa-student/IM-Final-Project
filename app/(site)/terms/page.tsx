import PageHero from "@/components/PageHero";

export const metadata = { title: "Terms & Conditions | D’Bay Samal" };

export default function Terms() {
  return (
    <>
      <PageHero title="Terms & Conditions">
        Please read these before booking with us.
      </PageHero>
      <section className="section">
        <div className="legal">
          <p className="muted">Last updated: November 2026</p>

          <h2>1. Booking requests</h2>
          <p>
            Booking requests sent through this website are not confirmed
            reservations. A booking is only confirmed once D’Bay Samal Beach
            &amp; Resort approves it by email, phone or through your My Bookings
            page.
          </p>

          <h2>2. Rates and payment</h2>
          <p>
            Rates are shown in Philippine pesos and may change without notice.
            No payment is taken on this website. Payment terms will be given to
            you when your booking is confirmed.
          </p>

          <h2>3. Cancellations</h2>
          <p>
            You can cancel a pending request from your My Bookings page. For
            confirmed bookings, please contact us as early as possible. [Add
            your cancellation and refund policy here.]
          </p>

          <h2>4. Check-in and check-out</h2>
          <p>
            [Add your check-in and check-out times here.] Please bring a valid
            ID when you arrive.
          </p>

          <h2>5. Guest conduct and safety</h2>
          <p>
            Guests are responsible for their own belongings and for the safety
            of children in their group. Guests are liable for damage to resort
            property. Please respect other guests and the surrounding community.
          </p>

          <h2>6. Limitation of liability</h2>
          <p>
            The resort is not responsible for loss, injury or delays caused by
            weather, sea conditions, transport schedules or events outside our
            control.
          </p>

          <h2>7. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The date at the top
            shows when they last changed.
          </p>

          <h2>8. Contact</h2>
          <p>
            Questions? Email{" "}
            <a href="mailto:info@dbaysamal.com">info@dbaysamal.com</a> or call
            09086776094.
          </p>
        </div>
      </section>
    </>
  );
}
