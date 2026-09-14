import { render, screen } from '@testing-library/react';
import Skeleton from './Skeleton';

describe('Skeleton Component', () => {
  it('renders default number of rows (3) when no rowCount is provided', () => {
    render(<Skeleton />);
    const rows = screen.getAllByTestId('skeleton-row');
    expect(rows).toHaveLength(3);
  });

  it('renders custom number of rows with rowCount prop', () => {
    render(<Skeleton rowCount={5} />);
    const rows = screen.getAllByTestId('skeleton-row');
    expect(rows).toHaveLength(5);
  });

  it('renders custom number of rows with rows prop', () => {
    render(<Skeleton rows={2} />);
    const rows = screen.getAllByTestId('skeleton-row');
    expect(rows).toHaveLength(2);
  });

  it('applies custom className and itemClassName', () => {
    render(<Skeleton rowCount={1} className="custom-skeleton" itemClassName="custom-item" />);
    const container = screen.getByTestId('skeleton-container');
    const row = screen.getByTestId('skeleton-row');

    expect(container).toHaveClass('custom-skeleton');
    expect(row).toHaveClass('custom-item');
  });
});
