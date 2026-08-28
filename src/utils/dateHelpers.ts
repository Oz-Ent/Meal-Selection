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

// The Mon–Fri work week is effectively over by Friday, so admin scheduling
// actions taken Fri/Sat/Sun target the coming week rather than the current one.
export function getSchedulingWeekAndYear(date: Date = new Date()): {
  week: number;
  year: number;
  isNextWeek: boolean;
} {
  const d = new Date(date.valueOf());
  d.setUTCHours(0, 0, 0, 0);

  const day = d.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const isNextWeek = day === 5 || day === 6 || day === 0;

  if (day === 5) {
    d.setUTCDate(d.getUTCDate() + 3); // Friday -> next Monday
  } else if (day === 6) {
    d.setUTCDate(d.getUTCDate() + 2); // Saturday -> next Monday
  } else if (day === 0) {
    d.setUTCDate(d.getUTCDate() + 1); // Sunday -> next Monday
  }

  const { week, year } = getISOWeekAndYear(d);
  return { week, year, isNextWeek };
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
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${start.getUTCDate()}, ${startYear} - ${endMonth} ${end.getUTCDate()}, ${endYear}`;
  }
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getUTCDate()} - ${end.getUTCDate()}, ${year}`;
  }
  return `${startMonth} ${start.getUTCDate()} - ${endMonth} ${end.getUTCDate()}, ${year}`;
}

export function getDateForDayOfWeek(
  week: number,
  year: number,
  dayNameOrIndex: string | number,
): Date {
  const date = getDateFromISOWeek(week, year);
  let offset = 0;
  if (typeof dayNameOrIndex === 'number') {
    offset = dayNameOrIndex;
  } else {
    const dayMap: Record<string, number> = {
      MONDAY: 0,
      TUESDAY: 1,
      WEDNESDAY: 2,
      THURSDAY: 3,
      FRIDAY: 4,
      SATURDAY: 5,
      SUNDAY: 6,
    };
    offset = dayMap[dayNameOrIndex.toUpperCase()] ?? 0;
  }
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

export function formatDayDate(week: number, year: number, dayName: string): string {
  const date = getDateForDayOfWeek(week, year, dayName);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function isMenuDayToday(
  week: number,
  year: number,
  dayName: string,
  refDate: Date = new Date(),
): boolean {
  const dayDate = getDateForDayOfWeek(week, year, dayName);
  dayDate.setUTCHours(0, 0, 0, 0);

  const refDayDate = new Date(
    Date.UTC(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()),
  );

  return dayDate.getTime() === refDayDate.getTime();
}

export function isMenuDayPast(
  week: number,
  year: number,
  dayName: string,
  refDate: Date = new Date(),
  cutoffHour: number = 10,
): boolean {
  const dayDate = getDateForDayOfWeek(week, year, dayName);
  dayDate.setUTCHours(0, 0, 0, 0);

  const refDayDate = new Date(
    Date.UTC(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()),
  );

  // If calendar date is strictly in the past
  if (dayDate.getTime() < refDayDate.getTime()) {
    return true;
  }

  // If it is current day (today), it closes at / after 10:00 AM
  if (dayDate.getTime() === refDayDate.getTime()) {
    return refDate.getHours() >= cutoffHour;
  }

  return false;
}

export function getMenuDayPastStatus(
  week: number,
  year: number,
  dayName: string,
  refDate: Date = new Date(),
  cutoffHour: number = 10,
): { isPast: boolean; isToday: boolean; isUpcoming: boolean; isClosedToday: boolean } {
  const dayDate = getDateForDayOfWeek(week, year, dayName);
  dayDate.setUTCHours(0, 0, 0, 0);

  const refDayDate = new Date(
    Date.UTC(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()),
  );

  const dayTime = dayDate.getTime();
  const todayTime = refDayDate.getTime();
  const isPastCalendar = dayTime < todayTime;
  const isToday = dayTime === todayTime;
  const isUpcoming = dayTime > todayTime;
  const isClosedToday = isToday && refDate.getHours() >= cutoffHour;

  return {
    isPast: isPastCalendar || isClosedToday,
    isToday,
    isUpcoming: isUpcoming && !isClosedToday,
    isClosedToday,
  };
}


