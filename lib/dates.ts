type Range = { check_in: string; check_out: string };

export const iso = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

// today's date in the Philippines (yyyy-mm-dd)
export const todayPH = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

// day-use bookings (check_in = check_out) still occupy that one day
export const effEnd = (b: Range) =>
  b.check_out > b.check_in ? b.check_out : addDays(b.check_in, 1);

export const overlaps = (a: Range, b: Range) =>
  a.check_in < effEnd(b) && b.check_in < effEnd(a);
