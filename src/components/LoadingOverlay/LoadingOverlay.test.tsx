import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay Component', () => {
  it('renders nothing when isLoading is false', () => {
    const { container } = render(<LoadingOverlay isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders overlay dialog with default message when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} />);
    expect(screen.getByRole('dialog', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders custom message when provided', () => {
    render(<LoadingOverlay isLoading={true} message="Saving changes..." />);
    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });
});
