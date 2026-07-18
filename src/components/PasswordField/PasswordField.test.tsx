import { render, screen, fireEvent } from '@testing-library/react';
import PasswordField from './PasswordField';

describe('PasswordField Component', () => {
    it('renders the label', () => {
        render(<PasswordField label="Password" id="password" />);
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders as a password input by default', () => {
        render(<PasswordField label="Password" id="password" />);
        const input = screen.getByLabelText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('toggles to text input when eye icon is clicked', () => {
        render(<PasswordField label="Password" id="password" />);
        const input = screen.getByLabelText('Password');
        expect(input).toHaveAttribute('type', 'password');

        // Click the Eye icon (show password)
        const toggleButtons = document.querySelectorAll('svg');
        fireEvent.click(toggleButtons[0]);
        expect(input).toHaveAttribute('type', 'text');
    });

    it('toggles back to password input when eye-off icon is clicked', () => {
        render(<PasswordField label="Password" id="password" />);
        const input = screen.getByLabelText('Password');

        // Show password
        const eyeIcon = document.querySelectorAll('svg')[0];
        fireEvent.click(eyeIcon);
        expect(input).toHaveAttribute('type', 'text');

        // Hide password
        const eyeOffIcon = document.querySelectorAll('svg')[0];
        fireEvent.click(eyeOffIcon);
        expect(input).toHaveAttribute('type', 'password');
    });

    it('calls onChange when text is entered', () => {
        const onChange = jest.fn();
        render(<PasswordField label="Password" id="password" onChange={onChange} />);
        const input = screen.getByLabelText('Password');
        fireEvent.change(input, { target: { value: 'secret123' } });
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('displays the provided value', () => {
        render(<PasswordField label="Password" id="password" value="myPassword" onChange={jest.fn()} />);
        const input = screen.getByLabelText('Password');
        expect(input).toHaveValue('myPassword');
    });

    it('applies custom className', () => {
        render(<PasswordField label="Password" id="password" className="custom-class" />);
        const input = screen.getByLabelText('Password');
        expect(input).toHaveClass('custom-class');
    });
});
