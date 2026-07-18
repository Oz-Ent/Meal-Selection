import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './Checkbox';

describe('Checkbox Component', () => {
    it('renders label when provided', () => {
        const onChange = jest.fn();
        render(<Checkbox label="Keep me signed in." checked={false} onChange={onChange} />);
        expect(screen.getByText('Keep me signed in.')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
        const onChange = jest.fn();
        const { container } = render(<Checkbox checked={false} onChange={onChange} />);
        const spans = container.querySelectorAll('span');
        expect(spans.length).toBe(0);
    });

    it('renders a checkbox input', () => {
        const onChange = jest.fn();
        render(<Checkbox label="Accept" checked={false} onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
    });

    it('reflects checked state', () => {
        const onChange = jest.fn();
        render(<Checkbox label="Accept" checked={true} onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('reflects unchecked state', () => {
        const onChange = jest.fn();
        render(<Checkbox label="Accept" checked={false} onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    it('calls onChange with the new checked value when clicked', () => {
        const onChange = jest.fn();
        render(<Checkbox label="Accept" checked={false} onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('applies custom className', () => {
        const onChange = jest.fn();
        const { container } = render(<Checkbox label="Accept" checked={false} onChange={onChange} className="custom-class" />);
        const label = container.querySelector('label');
        expect(label).toHaveClass('custom-class');
    });
});
