type RoomRelation =
  | { name: string }
  | { name: string }[]
  | null
  | undefined;

export function getRoomName(room: RoomRelation) {
  return Array.isArray(room) ? room[0]?.name : room?.name;
}
