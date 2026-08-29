import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditMenu } from './EditMenu';

const mockUpdateMenu = jest.fn();
const mockAssignMeals = jest.fn();
const mockToggleMenuMealStatus = jest.fn();

const mockMenu = { id: 1, title: 'Weekly Special Menu' };
const mockMenuDays = [
  { id: 10, day: 'MONDAY', menuId: 1 },
  { id: 20, day: 'TUESDAY', menuId: 1 },
];
const mockMenuMeals = [
  {
    id: 101,
    menuDayId: 10,
    isActive: true,
    meal: { id: 1, name: 'Waakye Deluxe', imagePath: '', isActive: true },
  },
];
const mockAllMeals = {
  meals: [
    { id: 1, name: 'Waakye Deluxe', isActive: true },
    { id: 2, name: 'Banku & Tilapia', isActive: true },
    { id: 3, name: 'Jollof Rice', isActive: true },
  ],
};

jest.mock('../../../api/useApiQueries', () => ({
  useMenuQuery: () => ({ data: mockMenu, isLoading: false }),
  useMenuDaysQuery: () => ({ data: mockMenuDays, isLoading: false }),
  useMenuMealsQuery: () => ({ data: mockMenuMeals, isLoading: false }),
  useMealsQuery: () => ({ data: mockAllMeals, isLoading: false }),
  useUpdateMenuMutation: () => ({ mutateAsync: mockUpdateMenu, isPending: false }),
  useAssignMealsMutation: () => ({ mutateAsync: mockAssignMeals, isPending: false }),
  useToggleMenuMealStatusMutation: () => ({ mutateAsync: mockToggleMenuMealStatus, isPending: false }),
}));

function renderEditMenu() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/menu/edit/1']}>
        <Routes>
          <Route path="/admin/menu/edit/:menuId" element={<EditMenu />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('EditMenu Admin Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders menu days and assigned meals', () => {
    renderEditMenu();

    expect(screen.getByText('Weekly Special Menu')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Waakye Deluxe')).toBeInTheDocument();
    expect(screen.getByText('Add meals to weekday')).toBeInTheDocument();
  });

  it('switches to editing mode and allows removing meals locally', () => {
    renderEditMenu();

    const editBtn = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editBtn);

    expect(screen.getByText('Editing Weekly Special Menu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: 'Remove meal' });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Waakye Deluxe')).not.toBeInTheDocument();
  });

  it('allows clearing meals for a day in editing mode', () => {
    renderEditMenu();

    const editBtn = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editBtn);

    const clearBtn = screen.getByText('Clear meal(s)');
    fireEvent.click(clearBtn);

    expect(screen.queryByText('Waakye Deluxe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Add meals to weekday')).toHaveLength(2);
  });

  it('opens modal to add meals and saves menu changes', async () => {
    mockUpdateMenu.mockResolvedValue({});
    mockAssignMeals.mockResolvedValue({});

    renderEditMenu();

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    // Click Add Meals for Tuesday
    const addMealsButtons = screen.getAllByRole('button', { name: /Add Meals/i });
    fireEvent.click(addMealsButtons[1]); // Tuesday

    // Select Jollof Rice in modal
    expect(screen.getByText('All meals')).toBeInTheDocument();
    const jollofItem = screen.getByText('Jollof Rice').closest('button');
    fireEvent.click(jollofItem!);

    // Click Add in modal
    const modalAddBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(modalAddBtn);

    // Save menu
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateMenu).toHaveBeenCalledWith({
        id: 1,
        data: { title: 'Weekly Special Menu' },
      });
    });
  });

  it('prompts unsaved changes modal when clicking back in edit mode and allows discarding', () => {
    renderEditMenu();

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByText('Editing Weekly Special Menu')).toBeInTheDocument();

    // Click back button
    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);

    // Modal should be open
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(screen.getByText(/Would you like to save or discard your changes before leaving/i)).toBeInTheDocument();

    // Click Discard
    const discardBtn = screen.getByRole('button', { name: 'Discard' });
    fireEvent.click(discardBtn);

    // Modal closes
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('allows saving and exiting from the unsaved changes modal', async () => {
    mockUpdateMenu.mockResolvedValue({});

    renderEditMenu();

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    // Click back button
    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);

    // Modal open, click Save & Exit
    const saveExitBtn = screen.getByRole('button', { name: 'Save & Exit' });
    fireEvent.click(saveExitBtn);

    await waitFor(() => {
      expect(mockUpdateMenu).toHaveBeenCalledWith({
        id: 1,
        data: { title: 'Weekly Special Menu' },
      });
    });
  });
});
