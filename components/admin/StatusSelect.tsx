"use client";
import { useRouter } from "next/navigation";
import { setBookingStatus } from "@/app/actions";

type Status = "pending" | "confirmed" | "declined" | "cancelled";

export default function StatusSelect({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();

  async function change(value: Status) {
    const res = await setBookingStatus(id, value);
    if (!res.ok) return alert(res.error);
    router.refresh();
  }

  return (
    <select
      className={`status st-${status}`}
      value={status}
      onChange={(e) => change(e.target.value as Status)}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="declined">Declined</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
