export default function AboutPhoto() {
  return (
    <div className="about-photo">
      <img
        className="main"
        src="/images/about-garden.png"
        alt="Resort garden pathway"
      />
      <span className="polaroid">
        <img src="/images/about-sunset.png" alt="Sunset at the resort" />
      </span>
      <span className="badge">
        <img src="/images/logo-circle.png" alt="" />
      </span>
    </div>
  );
}
