import { useState, useMemo } from 'react';
import {
  BarChart3,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import NavBar from '../../../components/NavBar/NavBar';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';
import StatCard from '../../../components/StatCard/StatCard';
import Badge from '../../../components/Badge/Badge';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { Tabs } from '../../../components/Tabs/Tabs';
import { useAnalyticsDashboardQuery } from '../../../api/useApiQueries';
import { formatDateRange, getDateFromISOWeek } from '../../../utils/dateHelpers';

type ChartTab = 'per-week' | 'per-month' | 'accumulated';

export function Analytics() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [chartTab, setChartTab] = useState<ChartTab>('accumulated');

  const { data, isLoading, refetch, isRefetching } = useAnalyticsDashboardQuery({
    date: selectedDate,
  });

  const getProjectionBadge = (status?: string) => {
    switch (status) {
      case 'PROJECTED_OVERSPENT':
        return <Badge variant="danger" size="xs" label="Overspend Alert" />;
      case 'PROJECTED_SURPLUS':
        return <Badge variant="success" size="xs" label="Projected Surplus" />;
      default:
        return <Badge variant="neutral" size="xs" label="On Track" />;
    }
  };

  // Prepare the first graph's expenditure breakdown for the selected period.
  const chartConfig = useMemo(() => {
    const weeks = data?.weeklyExpenditure ?? [];
    if (weeks.length === 0) {
      return { xLabels: [], series: [] };
    }

    const expenditure =
      chartTab === 'per-month'
        ? Object.values(
            weeks.reduce<
              Record<string, { label: string; totalPortions: number; unitCostTotal: number; totalCost: number }>
            >(
              (months, week) => {
                const weekStart = getDateFromISOWeek(week.week, week.year);
                const monthKey = `${weekStart.getUTCFullYear()}-${weekStart.getUTCMonth()}`;
                const month = months[monthKey] ?? {
                  label: weekStart.toLocaleString('en-US', {
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  }),
                  totalPortions: 0,
                  unitCostTotal: 0,
                  totalCost: 0,
                };
                month.totalPortions += week.totalPortions;
                month.unitCostTotal += week.totalPortions * week.unitCost;
                month.totalCost += week.totalCost;
                months[monthKey] = month;
                return months;
              },
              {},
            ),
          ).map((month) => ({
            label: month.label,
            unitCost: month.totalPortions > 0 ? month.unitCostTotal / month.totalPortions : 0,
            totalCost: month.totalCost,
          }))
        : weeks.map((week) => ({
            label: `W${week.week}`,
            unitCost: week.unitCost,
            totalCost: week.totalCost,
          }));
    const xLabels = expenditure.map((item) => item.label);
    const totalBudget = data?.budget.totalBudget ?? 0;
    const periodCount = Math.max(1, expenditure.length);
    const costs = expenditure.map((item) => item.totalCost);
    const unitCosts = expenditure.map((item) => item.unitCost);

    if (chartTab === 'accumulated') {
      for (let index = 1; index < costs.length; index += 1) {
        costs[index] += costs[index - 1];
      }
    }

    const budgetTarget = chartTab === 'accumulated' ? totalBudget : totalBudget / periodCount;
    const budgetLabel = chartTab === 'accumulated'
      ? 'Budget (Constant)'
      : chartTab === 'per-month'
        ? 'Budget (Monthly Target)'
        : 'Budget (Weekly Target)';

    return {
      xLabels,
      series: [
        {
          id: 'total-cost',
          label: chartTab === 'accumulated' ? 'Accumulated Cost' : 'Total Cost',
          data: costs.map((cost) => Number(cost.toFixed(2))),
          color: '#00633d',
          curve: 'monotoneX' as const,
        },
        {
          id: 'unit-cost',
          label: 'Unit Cost',
          data: unitCosts.map((cost) => Number(cost.toFixed(2))),
          color: '#3b82f6',
          curve: 'monotoneX' as const,
        },
        {
          id: 'budget',
          label: budgetLabel,
          data: expenditure.map(() => Number(budgetTarget.toFixed(2))),
          color: '#e11d48',
          showMark: false,
        },
      ],
    };
  }, [data, chartTab]);

  // Prepare day of week bar chart data (Monday - Friday)
  const dayOfWeekConfig = useMemo(() => {
    const DAY_MAP: Record<string, string> = {
      MONDAY: 'Mon',
      TUESDAY: 'Tue',
      WEDNESDAY: 'Wed',
      THURSDAY: 'Thu',
      FRIDAY: 'Fri',
    };
    const list = (data?.dayOfWeekExpenditure ?? []).filter((item) => item.day in DAY_MAP);
    if (list.length === 0) {
      return { xLabels: [], series: [] };
    }

    const xLabels = list.map((item) => DAY_MAP[item.day] || item.day.slice(0, 3));
    const costs = list.map((item) => item.totalCost);

    return {
      xLabels,
      series: [
        {
          id: 'day-cost',
          label: 'Catered Cost',
          data: costs,
          color: '#00633d', // Primary brand green
          valueFormatter: (val: number | null) =>
            val != null ? `¢${val.toFixed(2)}` : '',
        },
      ],
    };
  }, [data]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      <NavBar
        backUrl="/admin/activities"
        title="Analytics"
        rightElement={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Filter Analytics Date"
              className="h-8 rounded-lg border border-border bg-surface px-2 text-xs font-semibold text-text-primary outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Refresh analytics"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : !data ? (
          <EmptyState
            icon={<BarChart3 className="h-8 w-8 text-text-muted" />}
            title="No Analytics Available"
            description="Unable to load analytics data for the selected period. Ensure an active budget and meal schedules exist."
          />
        ) : (
          <>
            {/* Period Info Header */}
            <div className="flex flex-col items-center justify-center text-center gap-2 rounded-2xl border border-border bg-surface p-5 shadow-2xs">
              <h2 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wide">
                {data.budget.title || 'Catering Budget Period'}
              </h2>
              <span className="text-3xl sm:text-4xl font-extrabold text-text-primary">
                {`¢${data.budget.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
              <p className="text-xs text-text-secondary">
                {formatDateRange(data.period.startDate, data.period.endDate)}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                {getProjectionBadge(data.budget.projectedStatus)}
              </div>
            </div>
            
            {/* StatCards: 2 Stacked + 1 Full Height */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
              {/* Column 1: Stacked Budget Consumed & Daily Burn Rate */}
              <div className="flex flex-col gap-3.5">
                <StatCard
                  className="flex-1"
                  title="Budget Consumed"
                  value={`¢${data.budget.consumed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  subtitle={
                    data.budget.remaining >= 0
                      ? `¢${data.budget.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining`
                      : `¢${Math.abs(data.budget.remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} deficit`
                  }
                  icon={<Wallet className="h-5 w-5" />}
                  iconVariant={data.budget.status === 'OVERSPENT' ? 'danger' : 'primary'}
                  progress={data.budget.consumptionPercentage}
                />

                <StatCard
                  className="flex-1"
                  title="Avg Daily Spend"
                  value={`¢${data.budget.dailyBurnRate.toFixed(2)} / day`}
                  subtitle={`Projected: ¢${data.budget.projectedTotalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  iconVariant={data.budget.projectedStatus === 'PROJECTED_OVERSPENT' ? 'danger' : 'info'}
                />
              </div>

              {/* Column 2: Meals Delivered spanning full height */}
              <StatCard
                className="h-full"
                title="Meals Delivered"
                value={`${data.selections.fulfillmentRatePercentage}%`}
                icon={<CheckCircle2 className="h-5 w-5" />}
                iconVariant="success"
                children={
                  <div className="flex flex-col gap-2 items-start w-full ">
                    <dl className="flex flex-col gap-2 sm:self-auto w-full">
                      <dt className='flex flex-row items-baseline gap-2 border-b pb-2 border-border'>
                        <span className="text-lg font-semibold">
                          {data.selections.fulfilled}
                        </span>
                        <p className="text-sm text-text-secondary">
                          Delivered
                        </p>
                      </dt>
                      <dt className='flex flex-row items-baseline gap-2 border-b pb-2 border-border'>
                        <span className="text-lg font-semibold">
                          {data.selections.notFulfilled}
                        </span>
                        <p className="text-xs text-text-secondary">
                          Not Fulfilled
                        </p>
                      </dt>
                      <dt className='flex flex-row items-baseline gap-2'>
                        <span className="text-lg font-semibold">
                          {data.selections.pending}
                        </span>
                        <p className="text-xs text-text-secondary">
                          Pending
                        </p>
                      </dt>
                    </dl>
                  </div>
                }
                progress={data.selections.fulfillmentRatePercentage}
              />
            </section>

            {/* Expenditure Chart Section */}
            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Expenditure Breakdown</h2>
                  <p className="text-xs text-text-secondary">
                    {chartTab === 'accumulated'
                      ? 'Cumulative expenditure against the total budget'
                      : chartTab === 'per-month'
                        ? 'Monthly meal cost and total expenditure against budget allocation'
                        : 'Weekly meal cost and total expenditure against budget allocation'}
                  </p>
                </div>
                <div className="w-full sm:w-80">
                  <Tabs
                    value={chartTab}
                    onChange={(value) => setChartTab(value as ChartTab)}
                    className="w-full p-0.5 rounded-xl"
                  >
                    <Tabs.Options>
                      <Tabs.Option value="per-week" className="py-1 text-xs">
                        Per Week
                      </Tabs.Option>
                      <Tabs.Option value="per-month" className="py-1 text-xs">
                        Per Month
                      </Tabs.Option>
                      <Tabs.Option value="accumulated" className="py-1 text-xs">
                        Accumulated
                      </Tabs.Option>
                    </Tabs.Options>
                  </Tabs>
                </div>
              </div>

              {chartConfig.series.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">
                  No expenditure entries found for this period.
                </div>
              ) : (
                <div className="w-full pt-1">
                  <LineChart
                    xAxis={[
                      {
                        scaleType: 'point',
                        data: chartConfig.xLabels,
                        valueFormatter: (val) => String(val),
                      },
                    ]}
                    yAxis={[
                      {
                        valueFormatter: (val: number | null) =>
                          val != null ? `¢${Number(val).toLocaleString()}` : '',
                      },
                    ]}
                    series={chartConfig.series}
                    height={300}
                    grid={{ horizontal: true }}
                    margin={{ top: 24, right: 16, bottom: 24, left:0 }}
                    slotProps={{
                      legend: {
                        position: { vertical: 'top', horizontal: 'start' },
                      },
                    }}
                    sx={{
                      '& .MuiChartsAxis-line': { stroke: 'var(--color-border)' },
                      '& .MuiChartsAxis-tick': { stroke: 'var(--color-border)' },
                      '& .MuiChartsAxis-tickLabel': { fill: 'var(--color-text-secondary)' },
                      '& .MuiChartsGrid-line': { stroke: 'var(--color-border)', strokeDasharray: '3 3' },
                    }}
                  />
                </div>
              )}
            </section>

            {/* Weekday Expenditure Breakdown */}
            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Daily Expenditure Breakdown</h2>
                  <p className="text-xs text-text-secondary">Catered daily expenditure from Monday through Friday</p>
                </div>
                {dayOfWeekConfig.series.length > 0 && (
                  <Badge
                    variant="neutral"
                    size="xs"
                    label={`${dayOfWeekConfig.xLabels.length} Weekdays`}
                  />
                )}
              </div>

              {dayOfWeekConfig.series.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">
                  No daily expenditure distribution recorded yet.
                </div>
              ) : (
                <div className="w-full pt-1">
                  <BarChart
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: dayOfWeekConfig.xLabels,
                        categoryGapRatio: 0.65,
                      },
                    ]}
                    yAxis={[
                      {
                        valueFormatter: (val: number | null) =>
                          val != null ? `¢${Number(val).toLocaleString()}` : '',
                      },
                    ]}
                    series={dayOfWeekConfig.series}
                    borderRadius={12}
                    height={260}
                    grid={{ horizontal: true }}
                    margin={{ top: 20, right: 16, bottom: 5, left: 5 }}
                    slotProps={{
                      legend: {
                        position: { vertical: 'top', horizontal: 'start' },
                      },
                    }}
                    sx={{
                      '& .MuiChartsAxis-line': { stroke: 'var(--color-border)' },
                      '& .MuiChartsAxis-tick': { stroke: 'var(--color-border)' },
                      '& .MuiChartsAxis-tickLabel': { fill: 'var(--color-text-secondary)' },
                      '& .MuiChartsGrid-line': { stroke: 'var(--color-border)', strokeDasharray: '3 3' },
                      '& .MuiBarElement-root': {
                        rx: 12,
                        ry: 12,
                      },
                    }}
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNavbar activeTab="admin" />
    </main>
  );
}

export default Analytics;
