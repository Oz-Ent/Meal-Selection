export function getISOWeekAndYear(date: Date = new Date()): { week: number; year: number } {
  const d = new Date(date.valueOf());
  d.setUTCHours(0, 0, 0, 0);

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const day = d.getUTCDay();

  // Right from Saturday, selections are for the following week
  if (day === 6) {
    // Saturday -> shift +2 days to next Monday
    d.setUTCDate(d.getUTCDate() + 2);
  } else if (day === 0) {
    // Sunday -> shift +1 day to next Monday
    d.setUTCDate(d.getUTCDate() + 1);
  }

  // ISO week starts Monday (Mon=1 ... Sun=7)
  const isoDay = d.getUTCDay() || 7;
  // Shift to Thursday of this week (ISO anchor)
  d.setUTCDate(d.getUTCDate() + 4 - isoDay);

  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const dayDiff = (Number(d) - Number(yearStart)) / 86400000;
  const week = Math.floor(dayDiff / 7) + 1;

  return { week, year };
}

export function getDateFromISOWeek(week: number, year: number): Date {
  const simple = new Date(Date.UTC(year, 0, 4));
  const day = simple.getUTCDay() || 7;
  simple.setUTCDate(simple.getUTCDate() - day + 1);
  simple.setUTCDate(simple.getUTCDate() + (week - 1) * 7);
  return simple;
}

export function formatWeekDateRange(week: number, year: number): string {
  const start = getDateFromISOWeek(week, year);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 4); // Monday to Friday
  const startMonth = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getUTCDate()} - ${end.getUTCDate()}, ${year}`;
  }
  return `${startMonth} ${start.getUTCDate()} - ${endMonth} ${end.getUTCDate()}, ${year}`;
}
