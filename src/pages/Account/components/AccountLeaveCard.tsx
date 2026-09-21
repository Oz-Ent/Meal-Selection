import { CalendarDays, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import type { UserLeave } from '../../../api/Services/UserServices';
import { Card } from '../../../components/Card/Card';
import Badge from '../../../components/Badge/Badge';
import EmptyState from '../../../components/EmptyState/EmptyState';
import InfoBanner from '../../../components/Banner/InfoBanner';
import StatCard from '../../../components/StatCard/StatCard';

import { formatDate } from '../../../utils/dateHelpers';

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

  const isCurrentlyOnLeave = upcomingOrActiveLeaves.some((leave) => {
    const now = new Date();
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    return now >= start && now <= end;
  });

  return (
    <Card
      header={{
        title: 'Leave Days & Availability',
        subtitle: 'Synced automatically from DigiHR records',
        icon: <CalendarDays className="h-4 w-4" />,
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Availability Status Badge Row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-text-secondary">Current Availability</span>
          {isCurrentlyOnLeave ? (
            <Badge
              variant="warning"
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="Currently On Leave"
            />
          ) : (
            <Badge
              variant="success"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Available for Meals"
            />
          )}
        </div>

        {/* Leave Summary Counters */}
        <div className="grid grid-cols-2 gap-3">

          <StatCard
            title="Upcoming / Active"
            value={upcomingOrActiveLeaves.length}
          />
          <StatCard
            title="Total Leave Days"
            value={`${totalLeaveDays} ${totalLeaveDays === 1 ? 'Day' : 'Days'}`}
          />

        </div>
        
        {/* Leave Records List */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Scheduled Leave History
          </h4>

          {leaves.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-6 w-6" />}
              title="No leave records found"
              description="When leaves are approved in DigiHR, they will appear here and pause meal planning automatically."
            />
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border bg-surface-muted/40">
              {leaves.slice(0, 5).map((leave) => {
                const isPast = new Date(leave.endDate) < new Date();
                return (
                  <div key={leave.id} className="flex items-center justify-between p-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                          isPast
                            ? 'bg-surface-muted text-text-muted'
                            : 'bg-primary-light text-primary'
                        }`}
                      >
                        {leave.daysCount}d
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-primary">
                          <span>{formatDate(leave.startDate)}</span>
                          <ArrowRight className="h-3 w-3 text-text-muted" />
                          <span>{formatDate(leave.endDate)}</span>
                        </div>
                        <span className="text-[11px] text-text-muted block">
                          {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'} scheduled
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={isPast ? 'neutral' : 'success'}
                      size="xs"
                      label={isPast ? 'Completed' : 'Scheduled'}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info notice */}
        <InfoBanner
          icon={<ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />}
          variant="info"
          description="Leave days automatically exempt you from meal prep and catering on selected dates. If your schedule changes, update your leave in DigiHR."
        />
      </div>
    </Card>
  );
};
