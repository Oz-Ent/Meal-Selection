import { exportWeeklyReportToPdf, formatDay } from './exportMealReportPdf';
import type { WeeklyMealReport } from '../api/Services/MealSelectionServices';

const mockDocText = jest.fn();
const mockDocSave = jest.fn();

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: mockDocText,
    save: mockDocSave,
  }));
});

jest.mock('jspdf-autotable', () => {
  return jest.fn();
});

describe('exportMealReportPdf utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats day names properly', () => {
    expect(formatDay('MONDAY')).toBe('Monday');
    expect(formatDay('DAY_OF_WEEK')).toBe('Day Of Week');
  });

  it('exports weekly report to PDF with all days', () => {
    const mockReport: WeeklyMealReport = {
      MONDAY: {
        total: 10,
        response: [
          {
            id: 1,
            name: 'Waakye Deluxe',
            foodCode: 'WK-01',
            calories: 600,
            imagePath: null,
            count: 10,
            users: [],
          },
        ],
      },
      TUESDAY: {
        total: 5,
        response: [
          {
            id: 2,
            name: 'Jollof',
            foodCode: 'JL-01',
            calories: 650,
            imagePath: null,
            count: 5,
            users: [],
          },
        ],
      },
    };

    exportWeeklyReportToPdf({
      report: mockReport,
      selectedDay: 'ALL',
      titlePrefix: 'Weekly Meal Report',
    });

    expect(mockDocText).toHaveBeenCalledWith('Weekly Meal Report - All', 14, 15);
    expect(mockDocSave).toHaveBeenCalledWith('Meal_Report_All.pdf');
  });

  it('exports single day report when selectedDay is specified', () => {
    const mockReport: WeeklyMealReport = {
      MONDAY: {
        total: 10,
        response: [
          {
            id: 1,
            name: 'Waakye Deluxe',
            foodCode: 'WK-01',
            calories: 600,
            imagePath: null,
            count: 10,
            users: [],
          },
        ],
      },
    };

    exportWeeklyReportToPdf({
      report: mockReport,
      selectedDay: 'MONDAY',
    });

    expect(mockDocText).toHaveBeenCalledWith('Meal Selection Report - Monday', 14, 15);
    expect(mockDocSave).toHaveBeenCalledWith('Meal_Report_Monday.pdf');
  });
});
