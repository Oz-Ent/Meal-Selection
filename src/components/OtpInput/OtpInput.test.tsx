import { render, screen, fireEvent } from '@testing-library/react';
import { OtpInput } from './OtpInput';

describe('OtpInput Component', () => {
    it('renders the correct number of inputs by default (5)', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(5);
    });

    it('renders a custom number of inputs', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} length={4} />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(4);
    });

    it('displays the value in the correct inputs', () => {
        const onChange = jest.fn();
        render(<OtpInput value="123" onChange={onChange} />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs[0]).toHaveValue('1');
        expect(inputs[1]).toHaveValue('2');
        expect(inputs[2]).toHaveValue('3');
        expect(inputs[3]).toHaveValue('');
        expect(inputs[4]).toHaveValue('');
    });

    it('calls onChange when a digit is entered', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '5' } });
        expect(onChange).toHaveBeenCalled();
    });

    it('accepts arbitrary characters', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: 'a' } });
        expect(onChange).toHaveBeenCalledWith('a');
    });

    it('applies error styling when hasError is true', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} hasError />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs[0]).toHaveClass('border-msWarningRed');
    });

    it('applies normal styling when hasError is false', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} hasError={false} />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs[0]).toHaveClass('border-gray-300');
    });

    it('does not require numeric input', () => {
        const onChange = jest.fn();
        render(<OtpInput value="" onChange={onChange} />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: 'z' } });
        expect(onChange).toHaveBeenCalledWith('z');
    });

    it('handles backspace key down', () => {
        const onChange = jest.fn();
        render(<OtpInput value="12" onChange={onChange} />);
        const inputs = screen.getAllByRole('textbox');
        fireEvent.keyDown(inputs[1], { key: 'Backspace' });
        expect(onChange).toHaveBeenCalled();
    });
});
