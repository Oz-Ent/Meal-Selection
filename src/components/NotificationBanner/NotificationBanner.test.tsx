import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBanner } from './NotificationBanner';

describe('NotificationBanner Component', () => {
  it('renders title and description correctly', () => {
    render(
      <NotificationBanner
        title="Notice"
        description="Meal selections are closed."
        variant="closed"
      />
    );

    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('Meal selections are closed.')).toBeInTheDocument();
  });

  it('renders custom action button', () => {
    const handleAction = jest.fn();
    render(
      <NotificationBanner
        title="Guest Mode"
        action={<button onClick={handleAction}>Switch to Self</button>}
      />
    );

    const button = screen.getByRole('button', { name: 'Switch to Self' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dismiss button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <NotificationBanner
        title="Temporary Warning"
        onClose={handleClose}
      />
    );

    const dismissBtn = screen.getByLabelText('Dismiss banner');
    expect(dismissBtn).toBeInTheDocument();
    fireEvent.click(dismissBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies attached styles when attached prop is true', () => {
    const { container } = render(
      <NotificationBanner
        title="Attached Banner"
        attached={true}
      />
    );

    const bannerDiv = container.querySelector('[role="status"]');
    expect(bannerDiv).not.toHaveClass('rounded-2xl');
  });
});
