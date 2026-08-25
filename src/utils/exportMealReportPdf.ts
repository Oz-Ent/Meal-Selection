import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WeeklyMealReport } from '../api/Services/MealSelectionServices';

export const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const formatDay = (day: string): string =>
  day
    .toLowerCase()
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

export interface ExportWeeklyReportOptions {
  report: WeeklyMealReport;
  selectedDay?: string; // 'ALL' or a specific day name like 'MONDAY'
  titlePrefix?: string;
}

export function exportWeeklyReportToPdf({
  report,
  selectedDay = 'ALL',
  titlePrefix = 'Meal Selection Report',
}: ExportWeeklyReportOptions): void {
  const days = Object.entries(report).sort(
    ([firstDay], [secondDay]) => DAY_ORDER.indexOf(firstDay) - DAY_ORDER.indexOf(secondDay),
  );

  const selectedDays = selectedDay === 'ALL' ? days : days.filter(([day]) => day === selectedDay);

  if (selectedDays.length === 0) {
    return;
  }

  const doc = new jsPDF();
  const selectedDayLabel = selectedDay === 'ALL' ? 'All' : formatDay(selectedDay);
  const tableRows: string[][] = [];

  selectedDays.forEach(([day, data]) => {
    if (data.isHoliday) {
      tableRows.push([
        formatDay(day),
        `Holiday: ${data.holidayTitle || 'Public / Company Holiday'}`,
        '-',
      ]);
    }
    if (data.response.length === 0 && !data.isHoliday) {
      tableRows.push([formatDay(day), 'No selections recorded', '0']);
    } else {
      data.response.forEach((meal, index) => {
        tableRows.push([
          index === 0 && !data.isHoliday ? formatDay(day) : '',
          meal.name,
          String(meal.count),
        ]);
      });
    }
  });

  doc.text(`${titlePrefix} - ${selectedDayLabel}`, 14, 15);
  autoTable(doc, {
    head: [['Day', 'Food Item', 'Total Selections']],
    body: tableRows,
    startY: 20,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 45, 58] },
  });

  doc.save(`Meal_Report_${selectedDayLabel}.pdf`);
}
