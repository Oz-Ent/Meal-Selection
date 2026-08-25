import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SuccessModal } from './SuccessModal';

describe('SuccessModal Component', () => {
  it('renders the success message, subtitle and continue button', () => {
    render(
      <MemoryRouter>
        <SuccessModal />
      </MemoryRouter>,
    );
    expect(screen.getByText('Meals Locked In!!')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your weekly selection is submitted. You can update choices until the selection window closes./i,
      ),
    ).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    expect(continueBtn).toBeInTheDocument();
  });

  it('navigates to /activities (user home page) when Continue is clicked', () => {
    function CurrentPath() {
      return <p data-testid="current-path">{useLocation().pathname}</p>;
    }

    render(
      <MemoryRouter initialEntries={['/select-meal']}>
        <SuccessModal />
        <CurrentPath />
      </MemoryRouter>,
    );

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    expect(screen.getByTestId('current-path')).toHaveTextContent('/activities');
  });

  it('calls custom onClose handler if provided', () => {
    const mockOnClose = jest.fn();
    render(
      <MemoryRouter>
        <SuccessModal onClose={mockOnClose} />
      </MemoryRouter>,
    );

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom recipient text when targetName is provided', () => {
    render(
      <MemoryRouter>
        <SuccessModal targetName="Manasseh Amoadu" />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        /Weekly selection for Manasseh Amoadu is submitted. You can update choices until the selection window closes./i,
      ),
    ).toBeInTheDocument();
  });
});
