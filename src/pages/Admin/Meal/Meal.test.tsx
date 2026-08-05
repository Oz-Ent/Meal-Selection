import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Meal } from './Meal';
import {
  useCreateMealMutation,
  useFoodLibraryQuery,
  useMealsQuery,
} from '../../../api/useApiQueries';

jest.mock('../../../api/useApiQueries', () => ({
  useCreateMealMutation: jest.fn(),
  useFoodLibraryQuery: jest.fn(),
  useMealsQuery: jest.fn(),
}));

const foodItems = [
  { id: 1, name: 'Grains', foodCode: 'SG', foodGroup: 'SUPERGROUP', createdAt: '', updatedAt: '' },
  { id: 2, name: 'Rice', foodCode: 'BS', foodGroup: 'BASE', createdAt: '', updatedAt: '' },
  { id: 3, name: 'Chicken', foodCode: 'PR', foodGroup: 'PROTEIN', createdAt: '', updatedAt: '' },
  { id: 4, name: 'Fried', foodCode: 'PP', foodGroup: 'PREP', createdAt: '', updatedAt: '' },
] as const;

const mockUseMealsQuery = useMealsQuery as jest.MockedFunction<typeof useMealsQuery>;
const mockUseFoodLibraryQuery = useFoodLibraryQuery as jest.MockedFunction<
  typeof useFoodLibraryQuery
>;
const mockUseCreateMealMutation = useCreateMealMutation as jest.MockedFunction<
  typeof useCreateMealMutation
>;

describe('Meal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMealsQuery.mockReturnValue({
      data: { meals: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useMealsQuery>);
    mockUseFoodLibraryQuery.mockReturnValue({
      data: [...foodItems],
      isLoading: false,
    } as unknown as ReturnType<typeof useFoodLibraryQuery>);
    mockUseCreateMealMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useCreateMealMutation>);
  });

  it('renders empty page when no meals exist', () => {
    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/There are no meals, click on “add” to create a new meal/i),
    ).toBeInTheDocument();
  });

  it('renders meals returned by the API', () => {
    mockUseMealsQuery.mockReturnValue({
      data: {
        meals: [
          {
            id: 1,
            name: 'Pizza',
            imagePath: 'pizza.png',
            foodCode: 'SG-BS-PR-PP',
            calories: 200,
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

    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('opens add meal modal when Add button is clicked in NavBar', () => {
    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('New Meal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter name of the meal')).toBeInTheDocument();
  });

  it('adds a new meal and shows success status', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseCreateMealMutation.mockReturnValue({ mutateAsync } as unknown as ReturnType<
      typeof useCreateMealMutation
    >);
    render(
      <MemoryRouter>
        <Meal />
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText('Enter name of the meal');
    fireEvent.change(input, { target: { value: 'Burger' } });
    fireEvent.change(screen.getByLabelText('Supergroup'), { target: { value: 'SG' } });
    fireEvent.change(screen.getByLabelText('Base'), { target: { value: 'BS' } });
    fireEvent.change(screen.getByLabelText('Protein'), { target: { value: 'PR' } });
    fireEvent.change(screen.getByLabelText('Preparation'), { target: { value: 'PP' } });

    const submitBtn = screen.getByRole('button', { name: 'Add New Meal' });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('New meal created successfully')).toBeInTheDocument();
    expect(mutateAsync).toHaveBeenCalledWith({
      data: {
        name: 'Burger',
        foodCode: 'SG-BS-PR-PP',
        calories: undefined,
        description: undefined,
      },
      imageFile: null,
    });
  });
});
