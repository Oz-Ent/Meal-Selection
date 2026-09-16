import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';
import { formatWeekDateRange } from '../../../utils/dateHelpers';
import type { HistoryFilterState } from '../useHistoryFilters';

interface HistoryFilterPanelProps {
  state: HistoryFilterState;
  totalWeeks: number;
  onSetField: (
    field: 'startYear' | 'startWeek' | 'endYear' | 'endWeek' | 'order' | 'limit',
    value: string | number,
  ) => void;
  onQuickRange: (limit: number) => void;
  onResetFilters: () => void;
}

export function HistoryFilterPanel({
  state,
  totalWeeks,
  onSetField,
  onQuickRange,
  onResetFilters,
}: HistoryFilterPanelProps) {
  const { startYear, startWeek, endYear, endWeek, order, limit } = state;

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs transition-all sm:p-6">
      {/* Panel Header */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <Calendar size={16} className="text-primary" />
          <span>Week & Year Range Filters</span>
        </span>
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-text-muted hover:bg-danger-light hover:text-danger transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Filter Presets */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary mr-1">Quick ranges:</span>
        <button
          type="button"
          onClick={() => onQuickRange(4)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            limit === 4 && !startYear && !endYear
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-muted text-text-secondary hover:bg-surface'
          }`}
        >
          Last 4 Weeks
        </button>
        <button
          type="button"
          onClick={() => onQuickRange(12)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            limit === 12 && !startYear && !endYear
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-muted text-text-secondary hover:bg-surface'
          }`}
        >
          Last 12 Weeks
        </button>
        <button
          type="button"
          onClick={() => onQuickRange(20)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            limit === 20 && !startYear && !endYear
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-muted text-text-secondary hover:bg-surface'
          }`}
        >
          Last 20 Weeks (Default)
        </button>
      </div>

      {/* Range Inputs Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label
            htmlFor="history-from-year"
            className="mb-1.5 block text-xs font-semibold text-text-secondary"
          >
            From Year
          </label>
          <input
            id="history-from-year"
            type="number"
            placeholder="e.g. 2025"
            min={2000}
            max={2100}
            value={startYear}
            onChange={(e) => onSetField('startYear', e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="history-from-week"
            className="mb-1.5 block text-xs font-semibold text-text-secondary"
          >
            From Week (1-53)
          </label>
          <input
            id="history-from-week"
            type="number"
            placeholder="e.g. 40"
            min={1}
            max={53}
            value={startWeek}
            onChange={(e) => onSetField('startWeek', e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
          />
          {startWeek && Number(startWeek) >= 1 && Number(startWeek) <= 53 && (
            <span className="mt-1 block text-[11px] font-semibold text-primary">
              {formatWeekDateRange(Number(startWeek), Number(startYear) || new Date().getFullYear())}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="history-to-year"
            className="mb-1.5 block text-xs font-semibold text-text-secondary"
          >
            To Year
          </label>
          <input
            id="history-to-year"
            type="number"
            placeholder="e.g. 2026"
            min={2000}
            max={2100}
            value={endYear}
            onChange={(e) => onSetField('endYear', e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="history-to-week"
            className="mb-1.5 block text-xs font-semibold text-text-secondary"
          >
            To Week (1-53)
          </label>
          <input
            id="history-to-week"
            type="number"
            placeholder="e.g. 10"
            min={1}
            max={53}
            value={endWeek}
            onChange={(e) => onSetField('endWeek', e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
          />
          {endWeek && Number(endWeek) >= 1 && Number(endWeek) <= 53 && (
            <span className="mt-1 block text-[11px] font-semibold text-primary">
              {formatWeekDateRange(Number(endWeek), Number(endYear) || new Date().getFullYear())}
            </span>
          )}
        </div>
      </div>

      {/* Secondary Controls: Limit and Order */}
      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">Sort:</span>
            <div className="relative">
              <select
                id="history-sort-order"
                value={order}
                onChange={(e) => onSetField('order', e.target.value as 'asc' | 'desc')}
                className="h-9 cursor-pointer appearance-none rounded-xl border border-border bg-surface py-1.5 pl-3 pr-8 text-xs font-semibold text-text-primary shadow-2xs transition-all hover:border-border-hover focus:border-primary focus:outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">Per page:</span>
            <div className="relative">
              <select
                id="history-per-page-limit"
                value={limit}
                onChange={(e) => onSetField('limit', Number(e.target.value))}
                className="h-9 cursor-pointer appearance-none rounded-xl border border-border bg-surface py-1.5 pl-3 pr-8 text-xs font-semibold text-text-primary shadow-2xs transition-all hover:border-border-hover focus:border-primary focus:outline-none"
              >
                <option value={10}>10 weeks</option>
                <option value={20}>20 weeks (Default)</option>
                <option value={50}>50 weeks</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary border border-border">
            Total matching:{' '}
            <strong className="font-bold text-text-primary">{totalWeeks}</strong>{' '}
            {totalWeeks === 1 ? 'week' : 'weeks'}
          </span>
        </div>
      </div>
    </div>
  );
}
