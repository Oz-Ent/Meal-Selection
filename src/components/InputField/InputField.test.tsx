import { render, screen, fireEvent } from '@testing-library/react';
import InputField from './InputField';

describe('InputField Component', () => {
    it('renders an input by default and handles change', () => {
        const onChange = jest.fn();
        render(<InputField value="" onChange={onChange} placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');

        fireEvent.change(input, { target: { value: 'test' } });
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('renders a textarea when multiline is true', () => {
        const onChange = jest.fn();
        render(<InputField value="" onChange={onChange} multiline placeholder="Enter text" />);
        const textarea = screen.getByPlaceholderText('Enter text');
        expect(textarea).toBeInTheDocument();
        expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('renders label and handles focused floating state', () => {
        const onChange = jest.fn();
        const { container } = render(<InputField label="My Label" value="" onChange={onChange} />);
        expect(screen.getByText('My Label')).toBeInTheDocument();
        const input = container.querySelector('input');
        if (input) {
            fireEvent.focus(input);
            const label = screen.getByText('My Label');
            expect(label).toHaveClass('text-primary'); // Float active
            fireEvent.blur(input);
        }
    });

    it('renders error message and styles', () => {
        const onChange = jest.fn();
        render(<InputField value="" onChange={onChange} error errorMessage="Required field" />);
        expect(screen.getByText('Required field')).toBeInTheDocument();
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-red-500');
    });

    it('is disabled when disabled prop is true', () => {
        const onChange = jest.fn();
        render(<InputField value="" onChange={onChange} disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });
});
