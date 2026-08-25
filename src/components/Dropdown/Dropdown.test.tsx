import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown, { type DropdownOption } from './Dropdown';

const mockOptions: DropdownOption[] = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3', disabled: true },
];

describe('Dropdown Component', () => {
  it('renders placeholder when no value is selected', () => {
    render(
      <Dropdown
        value=""
        onChange={jest.fn()}
        options={mockOptions}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders the selected option label', () => {
    render(
      <Dropdown
        value="opt2"
        onChange={jest.fn()}
        options={mockOptions}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected from the menu', () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        value=""
        onChange={handleChange}
        options={mockOptions}
        placeholder="Select an option"
        ariaLabel="custom-select"
      />
    );

    // Open dropdown select
    const combobox = screen.getByRole('combobox', { name: 'custom-select' });
    fireEvent.mouseDown(combobox);

    // Click Option 1
    const option1 = screen.getByRole('option', { name: 'Option 1' });
    fireEvent.click(option1);

    expect(handleChange).toHaveBeenCalledWith('opt1');
  });

  it('disables the select when disabled prop is true', () => {
    render(
      <Dropdown
        value=""
        onChange={jest.fn()}
        options={mockOptions}
        placeholder="Select an option"
        disabled={true}
      />
    );

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
  });
});
