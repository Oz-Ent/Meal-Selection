import { render, screen } from '@testing-library/react';
import { UnsuccessModal } from './UnsuccesModal';

describe('UnsuccessModal Component', () => {
  it('renders the unsuccess message and buttons', () => {
    render(<UnsuccessModal />);
    expect(screen.getByText('Unsuccessful')).toBeInTheDocument();
    expect(
      screen.getByText(/The meals you have chosen for the week were not recorded successfully/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back To Choose Meals' })).toBeInTheDocument();
  });
});
