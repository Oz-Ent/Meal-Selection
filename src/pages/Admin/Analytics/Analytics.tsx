import { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
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

export function Analytics() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [chartTab, setChartTab] = useState<'per-week' | 'accumulated'>('accumulated');

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

  const getBudgetStatusBadge = (status?: string) => {
    switch (status) {
      case 'OVERSPENT':
        return <Badge variant="danger" size="xs" label="Overspent" />;
      case 'SURPLUS':
        return <Badge variant="success" size="xs" label="Surplus" />;
      default:
        return <Badge variant="info" size="xs" label="Balanced" />;
    }
  };

  // Prepare 3-line graph data for weekly expenditure
  const chartConfig = useMemo(() => {
    const weeks = data?.weeklyExpenditure ?? [];
    if (weeks.length === 0) {
      return { xLabels: [], series: [] };
    }

    const xLabels = weeks.map((w) => `W${w.week}`);
    const totalBudget = data?.budget.totalBudget ?? 0;
    const weekCount = Math.max(1, weeks.length);

    if (chartTab === 'accumulated') {
      // Accumulated View: cost climbs against total budget ceiling
      let runningSpend = 0;
      const accumulatedSpend = weeks.map((w) => {
        runningSpend += w.totalCost;
        return Number(runningSpend.toFixed(2));
      });

      let runningMealCost = 0;
      const accumulatedMealCost = weeks.map((w) => {
        runningMealCost += w.totalPortions * w.unitCost;
        return Number(runningMealCost.toFixed(2));
      });

      const budgetCeiling = weeks.map(() => totalBudget);

      return {
        xLabels,
        series: [
          {
            id: 'accumulated-cost',
            label: 'Accumulated Cost',
            data: accumulatedSpend,
            color: '#00633d', // Brand primary green
            curve: 'monotoneX' as const,
          },
          {
            id: 'accumulated-meal-cost',
            label: 'Meal Cost',
            data: accumulatedMealCost,
            color: '#3b82f6', // Blue
            curve: 'monotoneX' as const,
          },
          {
            id: 'budget-ceiling',
            label: 'Budget (Constant)',
            data: budgetCeiling,
            color: '#e11d48', // Red threshold ceiling
            showMark: false,
          },
        ],
      };
    } else {
      // Per-Week View: weekly cost, weekly meal cost, weekly budget target
      const weeklyCosts = weeks.map((w) => w.totalCost);
      const mealCosts = weeks.map((w) => Number((w.totalPortions * w.unitCost).toFixed(2)));
      const weeklyBudgetTarget = Number((totalBudget / weekCount).toFixed(2));
      const budgetLine = weeks.map(() => weeklyBudgetTarget);

      return {
        xLabels,
        series: [
          {
            id: 'weekly-cost',
            label: 'Cost per Week',
            data: weeklyCosts,
            color: '#00633d',
            curve: 'monotoneX' as const,
          },
          {
            id: 'weekly-meal-cost',
            label: 'Meal Cost',
            data: mealCosts,
            color: '#3b82f6',
            curve: 'monotoneX' as const,
          },
          {
            id: 'weekly-budget',
            label: 'Budget (Weekly Target)',
            data: budgetLine,
            color: '#e11d48',
            showMark: false,
          },
        ],
      };
    }
  }, [data, chartTab]);

  // Prepare day of week bar chart data (Monday - Friday)
  const dayOfWeekConfig = useMemo(() => {
    const list = data?.dayOfWeekExpenditure ?? [];
    if (list.length === 0) {
      return { xLabels: [], series: [] };
    }

    const DAY_MAP: Record<string, string> = {
      MONDAY: 'Mon',
      TUESDAY: 'Tue',
      WEDNESDAY: 'Wed',
      THURSDAY: 'Thu',
      FRIDAY: 'Fri',
    };

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
        title="Analytics Dashboard"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">
                    {data.budget.title || 'Catering Budget Period'}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {data.period.startDate} to {data.period.endDate} ({data.period.daysElapsed} of {data.period.daysTotal} days elapsed)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {getBudgetStatusBadge(data.budget.status)}
                {getProjectionBadge(data.budget.projectedStatus)}
              </div>
            </div>

            {/* 4 StatCards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. Budget Health */}
              <StatCard
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

              {/* 2. Daily Burn Rate */}
              <StatCard
                title="Daily Burn Rate"
                value={`¢${data.budget.dailyBurnRate.toFixed(2)} / day`}
                subtitle={`Projected: ¢${data.budget.projectedTotalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<TrendingUp className="h-5 w-5" />}
                iconVariant={data.budget.projectedStatus === 'PROJECTED_OVERSPENT' ? 'danger' : 'info'}
              />

              {/* 3. Delivery Clock Time */}
              <StatCard
                title="Avg. Arrival Time"
                value={data.selections.averageFulfillmentTimeOfDay || '12:30 PM'}
                subtitle={
                  data.selections.averageFulfillmentDurationMinutes
                    ? `~${data.selections.averageFulfillmentDurationMinutes}m fulfillment turnaround`
                    : 'Typical caterer delivery time'
                }
                icon={<Clock className="h-5 w-5" />}
                iconVariant="warning"
              />

              {/* 4. Fulfillment Rate */}
              <StatCard
                title="Meals Delivered"
                value={`${data.selections.fulfillmentRatePercentage}%`}
                subtitle={`${data.selections.fulfilled} delivered · ${data.selections.notFulfilled} missed · ${data.selections.pending} pending`}
                icon={<CheckCircle2 className="h-5 w-5" />}
                iconVariant="success"
                progress={data.selections.fulfillmentRatePercentage}
              />
            </section>

            {/* Weekly Spend Line Graph Section */}
            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Weekly Expenditure Trajectory</h2>
                  <p className="text-xs text-text-secondary">
                    {chartTab === 'accumulated'
                      ? 'Cumulative expenditure climbing against constant budget'
                      : 'Weekly meal cost & total cost against weekly budget allocation'}
                  </p>
                </div>

                {/* Swappable Tab (Per Week / Accumulated) */}
                <div className="w-full sm:w-auto">
                  <Tabs
                    value={chartTab}
                    onChange={(val) => setChartTab(val as 'per-week' | 'accumulated')}
                    className="w-full sm:w-60 p-0.5 rounded-xl"
                  >
                    <Tabs.Options>
                      <Tabs.Option value="per-week" className="py-1 text-xs">
                        Per Week
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
                    margin={{ top: 24, right: 16, bottom: 24, left: 38 }}
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

            {/* Day of Week Cost Breakdown (Bar Chart) */}
            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Day-of-Week Cost Breakdown</h2>
                  <p className="text-xs text-text-secondary">Catered daily expenditure from Monday through Friday</p>
                </div>
                {data.dayOfWeekExpenditure.length > 0 && (
                  <Badge
                    variant="neutral"
                    size="xs"
                    label={`${data.dayOfWeekExpenditure.reduce((acc, d) => acc + d.portions, 0)} Portions Total`}
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
