/** Ngày theo UTC 00:00 — tránh lệch timezone khi so khớp weekday */
export const startOfUtcDay = (input: Date): Date => {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const addUtcDays = (date: Date, days: number): Date => {
  const d = startOfUtcDay(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

export const eachUtcDayInRange = (
  from: Date,
  to: Date,
  weekdays: number[],
): Date[] => {
  const weekdaySet = new Set(weekdays);
  const start = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  const out: Date[] = [];

  for (let cursor = start; cursor <= end; cursor = addUtcDays(cursor, 1)) {
    if (weekdaySet.has(cursor.getUTCDay())) {
      out.push(new Date(cursor));
    }
  }

  return out;
};
