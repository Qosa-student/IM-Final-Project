export const roomImage = (image: string | null) =>
  !image ? null : image.startsWith("http") ? image : `/images/rooms/${image}`;
