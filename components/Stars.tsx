export default function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      {"☆".repeat(5 - n)}
    </span>
  );
}
