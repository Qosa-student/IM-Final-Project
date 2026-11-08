const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Resort",
    name: "D’Bay Samal Beach & Resort",
    telephone: "+639086776094",
    email: "info@dbaysamal.com",
    image: `${site}/images/hero.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Purok 7 Caliclic, Babak",
      addressLocality: "Samal",
      addressCountry: "PH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 7.1209234,
      longitude: 125.6688748,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
