import { render, screen } from '@testing-library/react';
import { AccountProfileCard } from './AccountProfileCard';
import type { UserProfileResponse } from '../../../api/Services/UserServices';

const mockProfile: UserProfileResponse = {
  id: 1,
  name: 'Kofi Mensah',
  email: 'kofi.mensah@example.com',
  referenceEmail: 'kofi@company.com',
  referenceId: 1042,
  roleName: 'Software Engineer',
  roleId: 2,
  status: 'ACTIVE',
  createdAt: '2023-01-15T00:00:00.000Z',
  isActivated: true,
  leaves: [],
  upcomingOrActiveLeaves: [],
  totalLeaveDays: 0,
};

describe('AccountProfileCard Component', () => {
  it('renders user initials avatar, full name, emails, and reference details', () => {
    render(<AccountProfileCard profile={mockProfile} />);

    // Initials: KM
    expect(screen.getByText('KM')).toBeInTheDocument();
    expect(screen.getByText('Kofi Mensah')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('#1042')).toBeInTheDocument();
    expect(screen.getByText('kofi.mensah@example.com')).toBeInTheDocument();
  });
});
