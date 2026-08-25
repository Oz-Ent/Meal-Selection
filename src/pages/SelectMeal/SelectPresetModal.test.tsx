import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectPresetModal } from './SelectPresetModal';

const mockPresets = [
  { id: 101, name: 'My Favorite Preset', menuId: 5, userId: 1 },
  { id: 102, name: 'Low Carb Preset', menuId: 5, userId: 1 },
  { id: 103, name: 'Old Preset', menuId: 99, userId: 1 },
];

jest.mock('../../api/useApiQueries', () => ({
  usePresetsByUserQuery: () => ({
    data: mockPresets,
    isLoading: false,
  }),
}));

describe('SelectPresetModal Component', () => {
  it('renders presets matching the menuId', () => {
    render(
      <SelectPresetModal
        isOpen={true}
        onClose={jest.fn()}
        menuId={5}
        userId={1}
        onApplyPreset={jest.fn()}
      />
    );

    expect(screen.getByText('Select preset menu')).toBeInTheDocument();
    expect(screen.getByText('My Favorite Preset')).toBeInTheDocument();
    expect(screen.getByText('Low Carb Preset')).toBeInTheDocument();
    expect(screen.queryByText('Old Preset')).not.toBeInTheDocument();
  });

  it('filters presets via search term input', () => {
    render(
      <SelectPresetModal
        isOpen={true}
        onClose={jest.fn()}
        menuId={5}
        userId={1}
        onApplyPreset={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search preset menu');
    fireEvent.change(searchInput, { target: { value: 'Low Carb' } });

    expect(screen.getByText('Low Carb Preset')).toBeInTheDocument();
    expect(screen.queryByText('My Favorite Preset')).not.toBeInTheDocument();
  });

  it('selects preset and calls onApplyPreset on confirm', async () => {
    const handleApply = jest.fn().mockResolvedValue(undefined);
    const handleClose = jest.fn();

    render(
      <SelectPresetModal
        isOpen={true}
        onClose={handleClose}
        menuId={5}
        userId={1}
        onApplyPreset={handleApply}
      />
    );

    const presetItem = screen.getByText('My Favorite Preset');
    fireEvent.click(presetItem);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith(mockPresets[0]);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
