import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Meal } from './Meal';
import {
  useCreateMealMutation,
  useDeleteMealsMutation,
  useMealsQuery,
  useUpdateMealMutation,
} from '../../../api/useApiQueries';

jest.mock('../../../api/useApiQueries', () => ({
  useCreateMealMutation: jest.fn(),
  useUpdateMealMutation: jest.fn(),
  useDeleteMealsMutation: jest.fn(),
  useMealsQuery: jest.fn(),
}));

const mockUseMealsQuery = useMealsQuery as jest.MockedFunction<typeof useMealsQuery>;
const mockUseCreateMealMutation = useCreateMealMutation as jest.MockedFunction<
  typeof useCreateMealMutation
>;
const mockUseUpdateMealMutation = useUpdateMealMutation as jest.MockedFunction<
  typeof useUpdateMealMutation
>;
const mockUseDeleteMealsMutation = useDeleteMealsMutation as jest.MockedFunction<
  typeof useDeleteMealsMutation
>;

describe('Meal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMealsQuery.mockReturnValue({
      data: { meals: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useMealsQuery>);
    mockUseCreateMealMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateMealMutation>);
    mockUseUpdateMealMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateMealMutation>);
    mockUseDeleteMealsMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteMealsMutation>);
  });

  it('renders empty page when no meals exist', () => {
    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );
    expect(screen.getByText(/There are no preset meals available/i)).toBeInTheDocument();
  });

  it('renders meals returned by the API and includes search bar', () => {
    mockUseMealsQuery.mockReturnValue({
      data: {
        meals: [
          {
            id: 1,
            name: 'Jollof Rice',
            imagePath: 'jollof.png',
            foodCode: 'R-JO-CH-F',
            calories: 750,
            description: null,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useMealsQuery>);

    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    expect(screen.getByText('Jollof Rice')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search meal...')).toBeInTheDocument();
  });

  it('filters meals by search query', () => {
    mockUseMealsQuery.mockReturnValue({
      data: {
        meals: [
          {
            id: 1,
            name: 'Jollof with Chicken Wings',
            imagePath: 'jollof.png',
            foodCode: 'R-JO-01',
            calories: 780,
            description: null,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 2,
            name: 'Fried Rice with Pork',
            imagePath: 'friedrice.png',
            foodCode: 'R-FR-02',
            calories: 850,
            description: null,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useMealsQuery>);

    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText('Search meal...');
    expect(screen.getByText('Jollof with Chicken Wings')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice with Pork')).toBeInTheDocument();

    // Type query to filter
    fireEvent.change(searchInput, { target: { value: 'jollof' } });
    expect(screen.getByText('Jollof with Chicken Wings')).toBeInTheDocument();
    expect(screen.queryByText('Fried Rice with Pork')).not.toBeInTheDocument();

    // Clear search using clear button
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    expect(screen.getByText('Jollof with Chicken Wings')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice with Pork')).toBeInTheDocument();
  });

  it('displays empty state when search finds no matching meals and can be cleared', () => {
    mockUseMealsQuery.mockReturnValue({
      data: {
        meals: [
          {
            id: 1,
            name: 'Jollof with Chicken Wings',
            imagePath: 'jollof.png',
            foodCode: 'R-JO-01',
            calories: 780,
            description: null,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useMealsQuery>);

    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText('Search meal...');
    fireEvent.change(searchInput, { target: { value: 'Salad' } });

    expect(screen.queryByText('Jollof with Chicken Wings')).not.toBeInTheDocument();
    expect(screen.getByText('No results found for "Salad"')).toBeInTheDocument();

    const clearButtons = screen.getAllByRole('button', { name: /clear search/i });
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(clearButtons[0]);

    expect(screen.getByText('Jollof with Chicken Wings')).toBeInTheDocument();
  });

  it('opens kebab options menu and renders options', () => {
    mockUseMealsQuery.mockReturnValue({
      data: {
        meals: [
          {
            id: 1,
            name: 'Jollof Rice',
            imagePath: 'jollof.png',
            foodCode: 'R-JO-CH-F',
            calories: 750,
            description: null,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useMealsQuery>);

    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    const moreOptionsBtn = screen.getByRole('button', { name: /More options/i });
    fireEvent.click(moreOptionsBtn);

    expect(screen.getByText('Edit meal')).toBeInTheDocument();
    expect(screen.getByText('Duplicate meal')).toBeInTheDocument();
    expect(screen.getByText('Delete Meal')).toBeInTheDocument();
  });

  it('opens new meal modal when floating Add button is clicked', () => {
    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('New meal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter meal name')).toBeInTheDocument();
  });
});
