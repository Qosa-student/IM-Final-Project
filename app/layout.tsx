import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

const serif = Playfair_Display({ subsets: ["latin"], variable: "--serif" });
const sans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description =
  "Relax. Unwind. Live the beach life at D’Bay Samal Beach & Resort in Caliclic, Island Garden City of Samal.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "D’Bay Samal Beach & Resort",
  description,
  openGraph: {
    title: "D’Bay Samal Beach & Resort",
    description,
    url: siteUrl,
    siteName: "D’Bay Samal Beach & Resort",
    images: ["/images/hero.png"],
    type: "website",
    locale: "en_PH",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
