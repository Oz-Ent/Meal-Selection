export function getISOWeekAndYear(date: Date = new Date()): { week: number; year: number } {
  const target = new Date(date.valueOf());
  // ISO week date weeks start on Monday, so shift days to align with Thursday
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  
  // First Thursday of the year
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  
  // Adjust to Thursday in week 1 and count number of weeks from date to week 1
  const weekNumber = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);

  return { week: weekNumber, year: target.getFullYear() };
}
