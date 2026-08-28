import { render, screen, fireEvent } from '@testing-library/react';
import { DefaultPresetWarningModal } from './DefaultPresetWarningModal';

describe('DefaultPresetWarningModal', () => {
  it('renders warning content with empty days and preset name', () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <DefaultPresetWarningModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        presetName="Test Preset"
        emptyDays={['Wednesday', 'Thursday']}
      />,
    );

    expect(screen.getByText('Set Incomplete Preset as Default?')).toBeInTheDocument();
    expect(screen.getByText('Test Preset')).toBeInTheDocument();
    expect(screen.getByText('Wednesday and Thursday')).toBeInTheDocument();
    expect(screen.getByText(/any unselected days will automatically be prefilled as/i)).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('calls onConfirm when Set as Default button is clicked', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();

    render(
      <DefaultPresetWarningModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        presetName="Test Preset"
        emptyDays={['Friday']}
      />,
    );

    const confirmBtn = screen.getByRole('button', { name: 'Set as Default' });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();

    render(
      <DefaultPresetWarningModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        presetName="Test Preset"
        emptyDays={['Friday']}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
