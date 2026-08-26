import { render, screen } from '@testing-library/react';
import MealDetailsModal from './MealDetailsModal';
import { useMealDetailsQuery } from '../../api/useApiQueries';

jest.mock('../../api/useApiQueries', () => ({
  useMealDetailsQuery: jest.fn(),
}));

describe('MealDetailsModal Component', () => {
  const mockUseMealDetailsQuery = useMealDetailsQuery as jest.Mock;

  it('renders loading state when query is pending', () => {
    mockUseMealDetailsQuery.mockReturnValue({
      isPending: true,
      isError: false,
      data: null,
    });

    render(
      <MealDetailsModal isOpen={true} foodCode="BT1" onClose={jest.fn()} />
    );

    expect(screen.getByText('Loading meal details...')).toBeInTheDocument();
  });

  it('renders error state when query fails', () => {
    mockUseMealDetailsQuery.mockReturnValue({
      isPending: false,
      isError: true,
      data: null,
    });

    render(
      <MealDetailsModal isOpen={true} foodCode="BT1" onClose={jest.fn()} />
    );

    expect(screen.getByText('Unable to load meal details.')).toBeInTheDocument();
  });

  it('renders meal details and ingredients when data is present', () => {
    mockUseMealDetailsQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        name: 'Banku & Tilapia',
        description: 'Freshly prepared banku with hot pepper and tilapia',
        imagePath: 'banku.jpg',
        calories: 550,
        ingredients: [
          { name: 'Corn Dough', foodGroup: 'Carbs' },
          { name: 'Tilapia', foodGroup: 'Protein' },
        ],
      },
    });

    render(
      <MealDetailsModal isOpen={true} foodCode="BT1" onClose={jest.fn()} />
    );

    expect(screen.getByText('Banku & Tilapia')).toBeInTheDocument();
    expect(screen.getByText('550 kcal')).toBeInTheDocument();
    expect(screen.getAllByText('Freshly prepared banku with hot pepper and tilapia').length).toBeGreaterThan(0);
    expect(screen.getByText('Corn Dough')).toBeInTheDocument();
    expect(screen.getByText('Tilapia')).toBeInTheDocument();
  });
});
