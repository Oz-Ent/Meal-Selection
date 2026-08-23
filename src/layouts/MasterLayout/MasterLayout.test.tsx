import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MasterLayout from './MasterLayout';

describe('MasterLayout Component', () => {
  it('renders a main element', () => {
    render(
      <MemoryRouter>
        <MasterLayout />
      </MemoryRouter>,
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('applies expected styling classes', () => {
    render(
      <MemoryRouter>
        <MasterLayout />
      </MemoryRouter>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex');
    expect(main).toHaveClass('flex-col');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('bg-app-bg');
  });
});
