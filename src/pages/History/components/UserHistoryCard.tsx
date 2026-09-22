import { useState } from 'react';
import { BookmarkPlus, ChevronDown, Flame } from 'lucide-react';
import MealForeground from '../../../assets/MealForeground.webp';
import type { UserWeeklyHistoryItem } from '../../../api/Services/MealSelectionServices';
import { DAY_ORDER, formatDay } from '../../../utils/exportMealReportPdf';
import { formatWeekDateRange, formatDayDate } from '../../../utils/dateHelpers';
import Button from '../../../components/Button/Button';

interface UserHistoryCardProps {
  weekItem: UserWeeklyHistoryItem;
  onOpenSavePreset: (weekItem: UserWeeklyHistoryItem) => void;
}

export function UserHistoryCard({ weekItem, onOpenSavePreset }: UserHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mealSelections = (weekItem.selection?.mealSelections || {}) as Record<
    string,
    {
      id?: number;
      mealName?: string;
      selectionType?: string;
      calories?: number | null;
      foodCode?: string | null;
      mealImagePath?: string | null;
    }
  >;

  const daysWithSelections = DAY_ORDER.filter((day) => day in mealSelections);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xs transition-all">
      {/* Week Header Accordion Bar */}
      <div className="flex items-center justify-between bg-surface px-4 py-3.5 transition-colors sm:px-6">
        <div
          role="button"
          tabIndex={0}
          onClick={toggleExpand}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleExpand();
            }
          }}
          className="flex flex-1 cursor-pointer flex-wrap items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="flex items-center gap-1.5 rounded-full text-[15px] font-bold text-text-secondary">
            <span className="flex flex-col">
              Week {weekItem.week} • {weekItem.menu.title}
              <span className="text-xs text-text-muted">
                {formatWeekDateRange(weekItem.week, weekItem.year)}
              </span>
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<BookmarkPlus size={13}/>}
            size="sm"
            variant="outline"
            aria-label="Save as preset"
            onClick={() => onOpenSavePreset(weekItem)}
          />
          <button
            type="button"
            onClick={toggleExpand}
            className="text-text-muted hover:text-text-primary p-0.5 cursor-pointer transition-rotate duration-300"
            aria-label={isExpanded ? 'Collapse week' : 'Expand week'}
          >
            {<ChevronDown className={isExpanded ? "rotate-180" : ""}/>}
          </button>
        </div>
      </div>

      {/* Week Details Body */}
      {isExpanded && (
        <div className="border-t border-border p-4 sm:p-6">
          {daysWithSelections.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">
              No individual meal selections recorded for this scheduled week.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {daysWithSelections.map((day) => {
                const selection = mealSelections[day];
                const isUnavailable =
                  selection?.selectionType === 'UNAVAILABLE' ||
                  selection?.mealName === 'Unavailable';
                const isHoliday =
                  selection?.selectionType === 'HOLIDAY' ||
                  selection?.mealName === 'Holiday';

                return (
                  <div
                    key={day}
                    className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface-muted/40 p-3 shadow-2xs"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface border border-border/50 shadow-2xs">
                      <img
                        src={selection?.mealImagePath || MealForeground}
                        alt={selection?.mealName || 'Meal'}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                          {formatDay(day)}
                        </span>
                        <span className="text-[10px] font-medium text-text-secondary bg-surface px-1.5 py-0.2 rounded border border-border/50">
                          {formatDayDate(weekItem.week, weekItem.year, day)}
                        </span>
                      </div>
                      <h4 className="truncate text-xs sm:text-sm font-bold text-text-primary">
                        {isUnavailable
                          ? 'Unavailable'
                          : isHoliday
                          ? 'Holiday'
                          : selection?.mealName || 'No selection'}
                      </h4>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-text-secondary">
                        {selection?.calories && (
                          <span className="flex items-center gap-0.5 text-warning-dark font-medium">
                            <Flame size={12} />
                            <span>{selection.calories} kcal</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
