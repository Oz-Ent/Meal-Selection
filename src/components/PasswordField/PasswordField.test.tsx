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

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('toggles back to password input when eye-off icon is clicked', () => {
    render(<PasswordField label="Password" id="password" />);
    const input = screen.getByLabelText('Password');

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
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
    render(
      <PasswordField label="Password" id="password" value="myPassword" onChange={jest.fn()} />,
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveValue('myPassword');
  });

  it('applies custom className', () => {
    render(<PasswordField label="Password" id="password" className="custom-class" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveClass('custom-class');
  });
});
