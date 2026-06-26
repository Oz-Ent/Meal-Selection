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
    });

    it('starts spinning on button click and calls onSpinComplete', () => {
        const onSpinComplete = jest.fn();
        render(<SpinWheel options={options} onSpinComplete={onSpinComplete} />);
        
        const spinButton = screen.getByRole('button', { name: 'Spin' });
        fireEvent.click(spinButton);
        
        expect(spinButton).toHaveTextContent('Spinning');
        
        // Fast-forward 5 seconds (5000ms delay for timeout)
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(spinButton).toHaveTextContent('Spin');
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
