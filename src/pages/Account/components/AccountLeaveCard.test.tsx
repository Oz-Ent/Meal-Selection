import { render, screen } from '@testing-library/react';
import { AccountLeaveCard } from './AccountLeaveCard';
import type { UserLeave } from '../../../api/Services/UserServices';

describe('AccountLeaveCard Component', () => {
  it('renders empty state when no leave records exist', () => {
    render(
      <AccountLeaveCard
        leaves={[]}
        upcomingOrActiveLeaves={[]}
        totalLeaveDays={0}
      />
    );

    expect(screen.getByText('Leave Days & Availability')).toBeInTheDocument();
    expect(screen.getByText('Available for Meals')).toBeInTheDocument();
    expect(screen.getByText('No leave records found')).toBeInTheDocument();
    expect(screen.getByText('0 Days')).toBeInTheDocument();
  });

  it('renders active leave status and scheduled leave history', () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const mockLeaves: UserLeave[] = [
      {
        id: 1,
        userId: 1,
        startDate: today,
        endDate: nextWeek,
        daysCount: 5,
        createdAt: today,
      },
    ];

    render(
      <AccountLeaveCard
        leaves={mockLeaves}
        upcomingOrActiveLeaves={mockLeaves}
        totalLeaveDays={5}
      />
    );

    expect(screen.getByText('Currently On Leave')).toBeInTheDocument();
    expect(screen.getByText('5 Days')).toBeInTheDocument();
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });
});
