import { render, screen, fireEvent, act } from '@testing-library/react';
import SpinWheel from './SpinWheel';

describe('SpinWheel Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const options = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
  ];

  it('renders correctly with options', () => {
    render(<SpinWheel options={options} onSpinComplete={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Spin' })).toBeInTheDocument();
    // Since pie slices are drawn in SVG, we just check SVG is rendered
    expect(document.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toHaveAttribute('transform', 'rotate(0 232 150)');
    expect(screen.getByText('Option 2')).toHaveAttribute('transform', 'rotate(0 68 150)');
  });

  it('truncates labels to ninety percent of the wheel radius', () => {
    render(
      <SpinWheel
        options={[{ label: 'A very long meal label that cannot fit', value: 1 }]}
        onSpinComplete={jest.fn()}
      />,
    );

    expect(screen.getByText('A very long meal...')).toBeInTheDocument();
  });

  it('starts spinning on button click and calls onSpinComplete', () => {
    const onSpinComplete = jest.fn();
    render(<SpinWheel options={options} onSpinComplete={onSpinComplete} />);

    const spinButton = screen.getByRole('button', { name: 'Spin' });
    fireEvent.click(spinButton);

    expect(spinButton).toBeDisabled();

    // Fast-forward 5 seconds (5000ms delay for timeout)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(spinButton).not.toBeDisabled();
    expect(onSpinComplete).toHaveBeenCalledTimes(1);
  });

  it('does not trigger spin if already spinning', () => {
    const onSpinComplete = jest.fn();
    render(<SpinWheel options={options} onSpinComplete={onSpinComplete} />);

    const spinButton = screen.getByRole('button', { name: 'Spin' });
    fireEvent.click(spinButton);
    fireEvent.click(spinButton); // Second click should be ignored

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onSpinComplete).toHaveBeenCalledTimes(1);
  });
});
