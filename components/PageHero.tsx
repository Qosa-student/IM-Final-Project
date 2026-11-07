import type { ReactNode } from "react";

export default function PageHero({
  title,
  children,
  tall = false,
}: {
  title: string;
  children?: ReactNode;
  tall?: boolean;
}) {
  return (
    <section className={`hero ${tall ? "tall" : ""}`}>
      <div className="hero-inner">
        <h1>{title}</h1>
        <img className="hero-icon" src="/images/island-icon.svg" alt="" />
        <p>{children}</p>
      </div>
    </section>
  );
}
