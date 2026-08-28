import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AddMenu } from './AddMenu';

const meals = [
  {
    id: 1,
    name: 'Pizza',
    imagePath: 'pizza.png',
    foodCode: 'SG-BS-PR-PP',
    calories: 500,
    description: null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    name: 'Burger',
    imagePath: 'burger.png',
    foodCode: 'SG-BS-PR-BG',
    calories: 600,
    description: null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
];

jest.mock('../../../api/useApiQueries', () => ({
  useMealsQuery: () => ({ data: { meals }, isLoading: false }),
  useCreateMenuWithAssignmentsMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

describe('AddMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/admin/menu/add-menu/TestMenu']}>
        <Routes>
          <Route path="/admin/menu/add-menu/:menuName" element={<AddMenu />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('renders the menu title, days, and Done button', () => {
    renderWithRouter();
    expect(screen.getByText('TestMenu')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('allows selecting meals for a day', () => {
    renderWithRouter();
    const addMealBtns = screen.getAllByRole('button', { name: /Add Meals/i });
    fireEvent.click(addMealBtns[0]); // Monday

    // Modal opens titled All meals
    expect(screen.getByText('All meals')).toBeInTheDocument();

    // Click the pizza meal button
    const pizzaBtn = screen.getByText('Pizza').closest('button');
    if (pizzaBtn) {
      fireEvent.click(pizzaBtn);
    }

    const addBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addBtn);

    // Modal closes and Pizza is displayed under Monday
    expect(screen.queryByText('All meals')).not.toBeInTheDocument();
    expect(screen.getAllByText('Pizza').length).toBeGreaterThan(0);
  });

  it('allows removing an individual meal and clearing all meals for a day', () => {
    renderWithRouter();
    const addMealBtns = screen.getAllByRole('button', { name: /Add Meals/i });
    fireEvent.click(addMealBtns[0]); // Monday

    // Select Pizza and Burger
    const pizzaBtn = screen.getByText('Pizza').closest('button');
    const burgerBtn = screen.getByText('Burger').closest('button');
    if (pizzaBtn) fireEvent.click(pizzaBtn);
    if (burgerBtn) fireEvent.click(burgerBtn);

    const addBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addBtn);

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();

    // Remove Pizza using the remove button
    const removeButtons = screen.getAllByRole('button', { name: 'Remove meal' });
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();

    // Clear remaining meals
    const clearBtn = screen.getByText('Clear meal(s)');
    fireEvent.click(clearBtn);

    expect(screen.queryByText('Burger')).not.toBeInTheDocument();
    expect(screen.getAllByText('Add meals to weekday').length).toBeGreaterThan(0);
  });
});
