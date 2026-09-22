import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MiscSuccessfulSelectionModal } from './MiscSuccessfulSelectionModal';

describe('MiscSuccessfulSelectionModal Component', () => {
  it('renders "This is for Fidel" header and "from Glorious" description', () => {
    render(
      <MemoryRouter>
        <MiscSuccessfulSelectionModal />
      </MemoryRouter>
    );

    expect(screen.getByText('This is for Fidel')).toBeInTheDocument();
    expect(screen.getByText('from Glorious')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('calls onClose callback when Continue button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <MemoryRouter>
        <MiscSuccessfulSelectionModal onClose={mockOnClose} />
      </MemoryRouter>
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
