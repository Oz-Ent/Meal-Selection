import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PresetBuilder } from './PresetBuilder';

const mockNavigate = jest.fn();
const mockMutateAsync = jest.fn().mockResolvedValue({ id: 99, name: 'Preset Menu 1' });

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { id: 132, email: 'test@example.com', name: 'Test User', roleId: 1, roleName: 'user' },
    },
  }),
}));

jest.mock('../../api/Services/PresetServices', () => ({
  presetService: {
    createItemsBatch: jest.fn().mockResolvedValue({ count: 1 }),
  },
}));

jest.mock('../../api/useApiQueries', () => ({
  useMenuQuery: () => ({ data: { id: 1, title: 'Menu 1' } }),
  usePresetWithDetailsQuery: () => ({ data: null }),
  useUpdatePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useMenuDaysQuery: () => ({
    data: [
      { id: 10, day: 'MONDAY' },
      { id: 20, day: 'TUESDAY' },
    ],
  }),
  useMenuMealsQuery: () => ({
    data: [
      {
        id: 101,
        menuDayId: 10,
        isActive: true,
        meal: { id: 1, name: 'Jollof Rice', imagePath: '' },
      },
    ],
  }),
  useCreatePresetMutation: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

describe('PresetBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, opens name modal on save, and creates preset', async () => {
    render(
      <MemoryRouter initialEntries={['/preset-meals/create/1']}>
        <Routes>
          <Route path="/preset-meals/create/:menuId" element={<PresetBuilder />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Preset Menu 1')).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice')).toBeInTheDocument();

    // Select Jollof Rice
    const radioBtn = screen.getAllByRole('radio')[0];
    fireEvent.click(radioBtn);

    // Save button opens name modal
    const saveBtn = screen.getByRole('button', { name: 'Save Preset' });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    // Modal appears
    expect(screen.getByText('New preset menu')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Enter preset menu name');
    fireEvent.change(nameInput, { target: { value: 'My Test Preset' } });

    const createBtn = screen.getByRole('button', { name: 'Create preset menu' });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'My Test Preset',
        menuId: 1,
        userId: 132,
        presetItems: [{ menuDayId: 10, dayMealId: 101 }],
      });
    });
  });
});
