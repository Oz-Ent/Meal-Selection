import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge Component', () => {
  it('renders default outline badge with label', () => {
    render(<Badge label="Default Badge" variant="primary" />);
    const label = screen.getByText('Default Badge');
    expect(label).toBeInTheDocument();
    expect(label.parentElement).toHaveClass('bg-[var(--color-badge-primary-outline-bg)]');
  });

  it('renders solid badge when type="solid"', () => {
    render(<Badge label="Solid Badge" variant="success" type="solid" />);
    const label = screen.getByText('Solid Badge');
    expect(label).toBeInTheDocument();
    expect(label.parentElement).toHaveClass('bg-[var(--color-badge-success-solid-bg)]');
  });

  it('renders hollow badge when type="hollow"', () => {
    render(<Badge label="Hollow Badge" variant="danger" type="hollow" />);
    const label = screen.getByText('Hollow Badge');
    expect(label).toBeInTheDocument();
    expect(label.parentElement).toHaveClass('bg-[var(--color-badge-danger-outline-bg)]');
  });

  it('renders dot when dot=true', () => {
    const { container } = render(<Badge label="With Dot" dot variant="info" />);
    const dot = container.querySelector('.rounded-full.h-1\\.5');
    expect(dot).toBeInTheDocument();
  });

  it('renders icon and children', () => {
    render(
      <Badge icon={<span data-testid="test-icon">★</span>}>
        <span>Custom Child</span>
      </Badge>
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Custom Child')).toBeInTheDocument();
  });
});
