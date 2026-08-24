import {
  getDateFromISOWeek,
  getISOWeekAndYear,
  formatWeekDateRange,
  getDateForDayOfWeek,
  formatDayDate,
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
});
