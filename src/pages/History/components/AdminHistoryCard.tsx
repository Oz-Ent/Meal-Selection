import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, UserCircle, Utensils } from 'lucide-react';
import Badge from '../../../components/Badge/Badge';
import type {
  WeeklyHistoryReportItem,
  WeeklyReportMeal,
} from '../../../api/Services/MealSelectionServices';
import { DAY_ORDER, formatDay, exportWeeklyReportToPdf } from '../../../utils/exportMealReportPdf';
import { formatWeekDateRange, formatDayDate } from '../../../utils/dateHelpers';
import Button from '../../../components/Button/Button';

interface AdminDishItemProps {
  dish: WeeklyReportMeal;
}

function AdminDishItem({ dish }: AdminDishItemProps) {
  const [isDishExpanded, setIsDishExpanded] = useState(false);

  const toggleDish = () => setIsDishExpanded((prev) => !prev);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs transition-all">
      {/* Dish Item Row Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleDish}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDish();
          }
        }}
        className="flex cursor-pointer flex-col p-3 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2.5">
          <Utensils size={15} className="text-text-secondary/55 shrink-0" />
          <span className="text-xs font-bold text-text-primary">{dish.name}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2.5 sm:mt-0">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <Badge variant="success" size="xs" label={`${dish.count} selected`} />
          </div>

          <div className="flex items-center text-text-muted">
            {isDishExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded User Breakdown List */}
      {isDishExpanded && (
        <div className="border-t border-border bg-surface-muted/50 px-4 py-3">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Selected by / for ({dish.users.length}):
          </span>
          {dish.users.length === 0 ? (
            <p className="text-xs text-text-muted">No users found for this meal.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {dish.users.map((user, idx) => {
                const displayName =
                  user.createdForName || (user.isGuest ? 'Guest Selection' : user.name);
                const showCreatedBy =
                  user.createdByName && user.createdByName !== user.createdForName;

                return (
                  <div
                    key={`${user.id ?? 'guest'}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-1.5 shadow-2xs"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary border border-primary/20">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="truncate text-xs font-medium text-text-primary"
                          title={displayName}
                        >
                          {displayName}
                        </span>
                      </div>
                      {showCreatedBy && (
                        <span
                          className="text-[10px] text-text-muted ml-8 truncate -mt-0.5"
                          title={`Selected by ${user.createdByName}`}
                        >
                          by {user.createdByName}
                        </span>
                      )}
                    </div>

                    {user.quantity > 1 && (
                      <span className="ml-2 shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-text-secondary border border-border">
                        x{user.quantity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AdminHistoryCardProps {
  weekItem: WeeklyHistoryReportItem;
}

export function AdminHistoryCard({ weekItem }: AdminHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const daysEntries = Object.entries(weekItem.selections).sort(
    ([firstDay], [secondDay]) => DAY_ORDER.indexOf(firstDay) - DAY_ORDER.indexOf(secondDay),
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xs transition-all">
      {/* Week Header Bar */}
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
        className="flex cursor-pointer flex-wrap items-center justify-between gap-2 bg-surface px-4 py-3.5 transition-colors sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-2.5">
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
          <Badge
            variant="secondary"
            size="sm"
            icon={<UserCircle size={13}/>}
            label={weekItem.totalResponses}
          />
          <Button
          label="Export PDF"
          size='sm'
          variant='outline'
          icon={<Download size={13} />}
          onClick={() => {
              exportWeeklyReportToPdf({
                report: weekItem.selections,
                titlePrefix: `Week ${weekItem.week} (${formatWeekDateRange(
                  weekItem.week,
                  weekItem.year,
                )}) Report`,
              });
            }}
          />
          <ChevronDown className={`text-text-secondary ${isExpanded ? "rotate-180 transition-all duration-300 ease-in-out" : "transition-all duration-300 ease-in-out"}`} />
        </div>
      </div>

      {/* Week Breakdown Table / List */}
      {isExpanded && (
        <div className="space-y-4 border-t border-border p-4 sm:p-6">
          {daysEntries.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">
              No aggregated meal orders recorded for this scheduled week.
            </p>
          ) : (
            daysEntries.map(([day, data]) => (
              <div
                key={day}
                className="rounded-2xl border border-border bg-surface-muted/30 p-4"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                      {formatDay(day)}
                    </span>
                    <span className="rounded-md bg-surface border border-border px-2 py-0.5 text-[11px] font-semibold text-text-secondary shadow-2xs">
                      {formatDayDate(weekItem.week, weekItem.year, day)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-text-secondary">
                    {data.total} total orders
                  </span>
                </div>

                <div className="space-y-2">
                  {data.response.map((dish) => (
                    <AdminDishItem key={dish.id} dish={dish} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
