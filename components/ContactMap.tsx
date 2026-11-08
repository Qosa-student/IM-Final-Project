// Exact embed link from Google Maps (Share → Embed a map) for D’Bay Samal Beach & Resort
const EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7918.087585936!2d125.6688748!3d7.1209234!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f96f032bcebfbf%3A0x88fb2d3906709e40!2sD%E2%80%99Bay%20Samal%20Beach%20%26%20Resort!5e0!3m2!1sen!2sph!4v1794112119060!5m2!1sen!2sph'

const LAT = 7.1209234
const LNG = 125.6688748
const NAME = 'D’Bay Samal Beach & Resort'

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`
const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`

export default function ContactMap() {
  return (
    <div className="map">
      <iframe
        src={EMBED_SRC}
        title={`Map showing ${NAME}`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="map-links">
        <a href={mapsLink} target="_blank" rel="noreferrer">Open in Google Maps</a>
        <a href={directionsLink} target="_blank" rel="noreferrer">Get directions</a>
      </div>
    </div>
  )
}