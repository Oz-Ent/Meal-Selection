/**
 * Safely parses a Date object or ISO / date string into a Date object normalized to UTC.
 * Prevents local timezone shifts (e.g. YYYY-MM-DD turning into previous day in negative UTC offsets).
 */
export function parseDateSafe(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'string') {
    // If it's a YYYY-MM-DD format (or starts with YYYY-MM-DD), parse components explicitly in UTC
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(Date.UTC(year, month, day));
    }
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Formats a single date into a human-readable string (e.g. "Sep 1, 2026").
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = parseDateSafe(dateInput);
  if (!d) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  };

  return d.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Formats a start and end date range concisely:
 * - Same month: "Sep 1 - 30, 2026"
 * - Different month, same year: "Aug 15 - Sep 15, 2026"
 * - Different year: "Dec 20, 2025 - Jan 10, 2026"
 */
export function formatDateRange(
  startDateInput: string | Date | null | undefined,
  endDateInput: string | Date | null | undefined,
): string {
  const start = parseDateSafe(startDateInput);
  const end = parseDateSafe(endDateInput);

  if (!start && !end) return '';
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  if (!start || !end) return '';

  const startMonth = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  }
  if (startMonth === endMonth) {
    if (startDay === endDay) {
      return `${startMonth} ${startDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
}

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
  return formatDateRange(start, end);
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

export function isMenuDayToday(
  week: number,
  year: number,
  dayName: string,
  refDate: Date = new Date(),
): boolean {
  return getMenuDayPastStatus(week, year, dayName, refDate).isToday;
}

export function isMenuDayPast(
  week: number,
  year: number,
  dayName: string,
  refDate: Date = new Date(),
  cutoffHour: number = 10,
): boolean {
  return getMenuDayPastStatus(week, year, dayName, refDate, cutoffHour).isPast;
}
