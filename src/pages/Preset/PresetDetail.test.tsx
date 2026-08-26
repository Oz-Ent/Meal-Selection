import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PresetDetail } from './PresetDetail';

const mockNavigate = jest.fn();
const mockUpdateMutateAsync = jest.fn().mockResolvedValue({ id: 10, name: 'Banku Maniac' });

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPresetWithDetails = {
  id: 10,
  name: 'Banku Maniac',
  menuId: 1,
  userId: 132,
  isDefault: false,
  presetItems: [{ id: 1, presetId: 10, menuDayId: 1, dayMealId: 101 }],
};

jest.mock('../../api/useApiQueries', () => ({
  usePresetWithDetailsQuery: () => ({ data: mockPresetWithDetails, isLoading: false }),
  useMenuDaysQuery: () => ({
    data: [{ id: 1, day: 'MONDAY' }],
  }),
  useMenuMealsQuery: () => ({
    data: [
      {
        id: 101,
        menuDayId: 1,
        isActive: true,
        meal: { id: 1, name: 'Rice And Goat Stew', imagePath: '' },
      },
    ],
  }),
  useUpdatePresetMutation: () => ({
    mutateAsync: mockUpdateMutateAsync,
  }),
  useMealDetailsQuery: () => ({ data: null, isPending: false, isError: false }),
}));

describe('PresetDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preset detail in view mode with checkmark and switches to edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/preset-meals/10']}>
        <Routes>
          <Route path="/preset-meals/:presetId" element={<PresetDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Banku Maniac')).toBeInTheDocument();
    expect(screen.getByText('Rice And Goat Stew')).toBeInTheDocument();

    // Click Edit button
    const editBtn = screen.getByRole('button', { name: 'Edit Preset' });
    fireEvent.click(editBtn);

    expect(screen.getByText('Editing Banku Maniac...')).toBeInTheDocument();

    // Save changes
    const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: 10,
        data: {
          presetItems: [{ menuDayId: 1, dayMealId: 101 }],
        },
      });
    });
  });
});
