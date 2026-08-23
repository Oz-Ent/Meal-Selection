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

  it('renders meals returned by the API', () => {
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
