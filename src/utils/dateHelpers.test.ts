import {
  getDateFromISOWeek,
  getISOWeekAndYear,
  formatWeekDateRange,
  getDateForDayOfWeek,
  formatDayDate,
  isMenuDayToday,
  isMenuDayPast,
  getMenuDayPastStatus,
} from './dateHelpers';

describe('dateHelpers', () => {
  it('correctly calculates ISO week and year', () => {
    // Aug 24, 2026 is Monday of week 35
    const monday = new Date(Date.UTC(2026, 7, 24));
    const result = getISOWeekAndYear(monday);
    expect(result.week).toBe(35);
    expect(result.year).toBe(2026);
  });

  it('correctly shifts Saturday to the following week', () => {
    // Saturday Aug 22, 2026 -> selections for Week 35
    const saturday = new Date(Date.UTC(2026, 7, 22));
    const result = getISOWeekAndYear(saturday);
    expect(result.week).toBe(35);
    expect(result.year).toBe(2026);
  });

  it('correctly calculates start date of an ISO week', () => {
    const monday = getDateFromISOWeek(35, 2026);
    expect(monday.getUTCFullYear()).toBe(2026);
    expect(monday.getUTCMonth()).toBe(7); // August (0-indexed: 7)
    expect(monday.getUTCDate()).toBe(24);
  });

  it('formats week date range within the same month', () => {
    // Week 35 of 2026 is Aug 24 - 28, 2026
    const range = formatWeekDateRange(35, 2026);
    expect(range).toBe('Aug 24 - 28, 2026');
  });

  it('formats week date range across different months', () => {
    // Week 36 of 2026: Aug 31 to Sep 4, 2026
    const range = formatWeekDateRange(36, 2026);
    expect(range).toBe('Aug 31 - Sep 4, 2026');
  });

  it('formats day date correctly', () => {
    expect(formatDayDate(35, 2026, 'MONDAY')).toBe('Aug 24');
    expect(formatDayDate(35, 2026, 'TUESDAY')).toBe('Aug 25');
    expect(formatDayDate(35, 2026, 'WEDNESDAY')).toBe('Aug 26');
    expect(formatDayDate(35, 2026, 'THURSDAY')).toBe('Aug 27');
    expect(formatDayDate(35, 2026, 'FRIDAY')).toBe('Aug 28');
  });

  it('gets date for day of week correctly with index and string name', () => {
    const monday = getDateForDayOfWeek(35, 2026, 'MONDAY');
    expect(monday.getUTCDate()).toBe(24);

    const friday = getDateForDayOfWeek(35, 2026, 4);
    expect(friday.getUTCDate()).toBe(28);
  });

  it('correctly identifies if a menu day is in the past, today, or upcoming with 10am cutoff', () => {
    // Reference date: Wednesday Aug 26, 2026 at 09:30 AM (before 10am cutoff)
    const refWedMorning = new Date(2026, 7, 26, 9, 30, 0);

    expect(isMenuDayToday(35, 2026, 'WEDNESDAY', refWedMorning)).toBe(true);
    expect(isMenuDayToday(35, 2026, 'THURSDAY', refWedMorning)).toBe(false);

    expect(isMenuDayPast(35, 2026, 'MONDAY', refWedMorning)).toBe(true);
    expect(isMenuDayPast(35, 2026, 'TUESDAY', refWedMorning)).toBe(true);
    expect(isMenuDayPast(35, 2026, 'WEDNESDAY', refWedMorning)).toBe(false); // open before 10am
    expect(isMenuDayPast(35, 2026, 'THURSDAY', refWedMorning)).toBe(false);
    expect(isMenuDayPast(35, 2026, 'FRIDAY', refWedMorning)).toBe(false);

    const statusWedMorning = getMenuDayPastStatus(35, 2026, 'WEDNESDAY', refWedMorning);
    expect(statusWedMorning).toEqual({ isPast: false, isToday: true, isUpcoming: false, isClosedToday: false });

    // Reference date: Wednesday Aug 26, 2026 at 10:15 AM (after 10am cutoff)
    const refWedAfter10 = new Date(2026, 7, 26, 10, 15, 0);

    expect(isMenuDayPast(35, 2026, 'WEDNESDAY', refWedAfter10)).toBe(true); // closed after 10am
    expect(isMenuDayPast(35, 2026, 'THURSDAY', refWedAfter10)).toBe(false); // upcoming day still open
    expect(isMenuDayPast(35, 2026, 'FRIDAY', refWedAfter10)).toBe(false);

    const statusWedAfter10 = getMenuDayPastStatus(35, 2026, 'WEDNESDAY', refWedAfter10);
    expect(statusWedAfter10).toEqual({ isPast: true, isToday: true, isUpcoming: false, isClosedToday: true });
  });
});



