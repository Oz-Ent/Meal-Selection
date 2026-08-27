import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  it('renders search input with placeholder', () => {
    const handleChange = jest.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
        placeholder="Search meals..."
      />,
    );

    const input = screen.getByPlaceholderText('Search meals...');
    expect(input).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('triggers onChange callback when typing in the input', () => {
    const handleChange = jest.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
        placeholder="Search meals..."
      />,
    );

    const input = screen.getByPlaceholderText('Search meals...');
    fireEvent.change(input, { target: { value: 'Rice' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays clear button when value is present and invokes onClear when clicked', () => {
    const handleChange = jest.fn();
    const handleClear = jest.fn();
    render(
      <SearchBar
        value="Jollof"
        onChange={handleChange}
        onClear={handleClear}
        placeholder="Search meals..."
      />,
    );

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
