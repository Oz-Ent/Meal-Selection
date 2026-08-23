import { CalendarDays, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import type { UserLeave } from '../../../api/Services/UserServices';

interface AccountLeaveCardProps {
  leaves: UserLeave[];
  upcomingOrActiveLeaves: UserLeave[];
  totalLeaveDays: number;
}

export const AccountLeaveCard = ({
  leaves = [],
  upcomingOrActiveLeaves = [],
  totalLeaveDays = 0,
}: AccountLeaveCardProps) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isCurrentlyOnLeave = upcomingOrActiveLeaves.some((leave) => {
    const now = new Date();
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    return now >= start && now <= end;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-primary border border-emerald-200/60">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Leave Days & Availability</h3>
            <p className="text-xs text-slate-500">Synced automatically from DigiHR records</p>
          </div>
        </div>

        {/* Availability Status Badge */}
        {isCurrentlyOnLeave ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Currently On Leave
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Available for Meals
          </span>
        )}
      </div>

      {/* Leave Summary Counters */}
      <div className="grid grid-cols-2 gap-3 pt-4 pb-4">
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100/90">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Upcoming / Active Leave Windows
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {upcomingOrActiveLeaves.length}
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100/90">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Leave Days Logged
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {totalLeaveDays} {totalLeaveDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      {/* Leave Records List */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-1">
          Scheduled Leave History
        </h4>

        {leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center px-4">
            <Clock className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No leave records found</p>
            <p className="text-xs text-slate-400 max-w-xs mt-0.5">
              When leaves or time-off are approved in DigiHR, they will appear here and pause meal planning automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/40">
            {leaves.slice(0, 5).map((leave) => {
              const isPast = new Date(leave.endDate) < new Date();
              return (
                <div key={leave.id} className="flex items-center justify-between p-3 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                        isPast
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-emerald-100 text-primary'
                      }`}
                    >
                      {leave.daysCount}d
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <span>{formatDate(leave.startDate)}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span>{formatDate(leave.endDate)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'} scheduled
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      isPast
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-primary border border-emerald-200/60'
                    }`}
                  >
                    {isPast ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-blue-50/60 p-3 text-xs text-blue-800 border border-blue-100">
        <ShieldAlert className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <p className="leading-relaxed">
          Leave days automatically exempt you from meal prep and catering on selected dates. If your schedule changes, update your leave in DigiHR.
        </p>
      </div>
    </div>
  );
};
