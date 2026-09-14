import { render, screen, fireEvent } from '@testing-library/react';
import SelectDropdown from './SelectDropdown';

describe('SelectDropdown Component', () => {
  const options = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  it('renders with current selected value', () => {
    render(
      <SelectDropdown
        value="light"
        onChange={jest.fn()}
        options={options}
      />
    );

    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('opens dropdown options when clicked and selects new option', () => {
    const onChange = jest.fn();
    render(
      <SelectDropdown
        value="light"
        onChange={onChange}
        options={options}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dark'));
    expect(onChange).toHaveBeenCalledWith('dark');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown when escape key is pressed or clicked outside', () => {
    render(
      <SelectDropdown
        value="light"
        onChange={jest.fn()}
        options={options}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Reopen and test outside click
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders dropdown list in a portal attached to document.body', () => {
    render(
      <SelectDropdown
        value="light"
        onChange={jest.fn()}
        options={options}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const listbox = screen.getByRole('listbox');
    expect(listbox.parentElement).toBe(document.body);
  });
});
