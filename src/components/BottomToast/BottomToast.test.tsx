import { render, screen, fireEvent, act } from '@testing-library/react';
import { BottomToast } from './BottomToast';

describe('BottomToast Component', () => {
  const defaultProps = {
    isOpen: true,
    type: 'success' as const,
    message: 'All choices have been cleared.',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders success toast correctly', () => {
    render(<BottomToast {...defaultProps} />);
    expect(screen.getByText('All choices have been cleared.')).toBeInTheDocument();
  });

  it('renders error toast correctly', () => {
    render(
      <BottomToast
        {...defaultProps}
        type="error"
        message="Something went wrong while clearing choices. Please try again."
      />,
    );
    expect(
      screen.getByText('Something went wrong while clearing choices. Please try again.'),
    ).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<BottomToast {...defaultProps} />);
    const closeBtn = screen.getByRole('button', { name: 'Close notification' });
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('auto dismisses after duration', () => {
    render(<BottomToast {...defaultProps} duration={3000} />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(<BottomToast {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('All choices have been cleared.')).not.toBeInTheDocument();
  });
});
