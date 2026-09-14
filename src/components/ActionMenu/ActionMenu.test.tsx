import { render, screen, fireEvent } from '@testing-library/react';
import ActionMenu from './ActionMenu';

describe('ActionMenu Component', () => {
  it('renders default trigger and opens compound items on click', () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();

    render(
      <ActionMenu triggerAriaLabel="Row options">
        <ActionMenu.Item onClick={handleEdit}>Edit</ActionMenu.Item>
        <ActionMenu.Item variant="danger" onClick={handleDelete} divider>
          Delete
        </ActionMenu.Item>
      </ActionMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Row options' });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();

    // Click item
    fireEvent.click(screen.getByText('Edit'));
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders using items array prop', () => {
    const onSelect = jest.fn();
    render(
      <ActionMenu
        items={[
          { label: 'Option 1', onClick: onSelect },
          { label: 'Option 2', onClick: jest.fn(), disabled: true },
        ]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Open options menu' });
    fireEvent.click(trigger);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    const opt2 = screen.getByText('Option 2').closest('button');
    expect(opt2).toBeDisabled();

    fireEvent.click(screen.getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders dropdown menu in a portal attached to document.body', () => {
    render(
      <ActionMenu>
        <ActionMenu.Item onClick={jest.fn()}>Action</ActionMenu.Item>
      </ActionMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Open options menu' });
    fireEvent.click(trigger);

    const menu = screen.getByRole('menu');
    expect(menu.parentElement).toBe(document.body);
  });

  it('closes on Escape key and outside click', () => {
    render(
      <ActionMenu>
        <ActionMenu.Item onClick={jest.fn()}>Action</ActionMenu.Item>
      </ActionMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Open options menu' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Reopen and test outside click
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
