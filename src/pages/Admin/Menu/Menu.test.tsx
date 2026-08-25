import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Menu } from './Menu';

const mockCreateSchedule = jest.fn();
const mockUpdateSchedule = jest.fn();
const mockUpdateMenu = jest.fn();
const mockDeleteMenu = jest.fn();
const mockCreateMenuWithAssignments = jest.fn();

jest.mock('../../../api/useApiQueries', () => ({
  useMenusQuery: jest.fn(),
  useWeekSchedulesQuery: jest.fn(),
  useCreateWeekScheduleMutation: () => ({ mutateAsync: mockCreateSchedule, isPending: false }),
  useUpdateWeekScheduleMutation: () => ({ mutateAsync: mockUpdateSchedule, isPending: false }),
  useUpdateMenuMutation: () => ({ mutateAsync: mockUpdateMenu, isPending: false }),
  useDeleteMenuMutation: () => ({ mutateAsync: mockDeleteMenu, isPending: false }),
  useCreateMenuWithAssignmentsMutation: () => ({
    mutateAsync: mockCreateMenuWithAssignments,
    isPending: false,
  }),
}));

import { useMenusQuery, useWeekSchedulesQuery } from '../../../api/useApiQueries';

const mockUseMenusQuery = useMenusQuery as jest.MockedFunction<typeof useMenusQuery>;
const mockUseWeekSchedulesQuery = useWeekSchedulesQuery as jest.MockedFunction<
  typeof useWeekSchedulesQuery
>;
const menu = {
  id: 1,
  title: 'Weekly Menu',
  description: 'Lunch plan',
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('Menu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMenusQuery.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
      typeof useMenusQuery
    >);
    mockUseWeekSchedulesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useWeekSchedulesQuery>);
  });

  it('renders empty page when no menus exist', () => {
    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );
    expect(screen.getByText(/There are no menus/i)).toBeInTheDocument();
  });

  it('renders menus returned by the API', () => {
    mockUseMenusQuery.mockReturnValue({ data: [menu], isLoading: false } as unknown as ReturnType<
      typeof useMenusQuery
    >);

    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );

    expect(screen.getByText('Weekly Menu')).toBeInTheDocument();
  });

  it('opens dropdown and displays rename, duplicate, and delete options', () => {
    mockUseMenusQuery.mockReturnValue({ data: [menu], isLoading: false } as unknown as ReturnType<
      typeof useMenusQuery
    >);

    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );

    const moreOptionsBtn = screen.getByRole('button', { name: /More options/i });
    fireEvent.click(moreOptionsBtn);

    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Duplicate menu')).toBeInTheDocument();
    expect(screen.getByText('Delete menu')).toBeInTheDocument();
  });

  it('opens new menu modal and redirects when name is entered', () => {
    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <Routes>
          <Route path="/admin/menu" element={<Menu />} />
          <Route
            path="/admin/menu/add-menu/:menuName"
            element={<div data-testid="add-menu-route">Add Menu Route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText('Enter menu name');
    fireEvent.change(input, { target: { value: 'NewMenu' } });

    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueBtn);

    expect(screen.getByTestId('add-menu-route')).toBeInTheDocument();
  });

  it('sets a non-active menu as active when option is clicked', async () => {
    const menu2 = {
      id: 2,
      title: 'Second Menu',
      description: 'Second lunch plan',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    mockUseMenusQuery.mockReturnValue({
      data: [menu, menu2],
      isLoading: false,
    } as unknown as ReturnType<typeof useMenusQuery>);
    // current schedule active is menu 1
    mockUseWeekSchedulesQuery.mockReturnValue({
      data: [
        {
          id: 101,
          week: 35,
          year: 2026,
          menu: { id: 1, title: 'Weekly Menu' },
          status: 'ACTIVE',
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useWeekSchedulesQuery>);

    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );

    const moreOptionsBtns = screen.getAllByRole('button', { name: /More options/i });
    fireEvent.click(moreOptionsBtns[1]);

    const setActiveBtn = screen.getByText('Set as active for this week');
    expect(setActiveBtn).toBeInTheDocument();
    fireEvent.click(setActiveBtn);

    expect(mockUpdateSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 101,
        data: expect.objectContaining({ menuId: 2, status: 'ACTIVE' }),
      }),
    );
  });

  it('allows dragging and dropping to reorder menus', () => {
    const menu2 = {
      id: 2,
      title: 'Second Menu',
      description: 'Second lunch plan',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    mockUseMenusQuery.mockReturnValue({
      data: [menu, menu2],
      isLoading: false,
    } as unknown as ReturnType<typeof useMenusQuery>);

    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );

    const cards = screen.getAllByText(/Weekly Menu|Second Menu/i);
    expect(cards[0]).toHaveTextContent('Weekly Menu');
    expect(cards[1]).toHaveTextContent('Second Menu');

    // Simulate drag and drop
    const cardElements = screen.getAllByRole('button', { name: /More options/i }).map((btn) => btn.closest('[draggable="true"]')!);
    fireEvent.dragStart(cardElements[0], {
      dataTransfer: { setData: jest.fn(), effectAllowed: 'move' },
    });
    fireEvent.dragOver(cardElements[1], {
      dataTransfer: { dropEffect: 'move' },
    });
    fireEvent.drop(cardElements[1], {
      dataTransfer: {},
    });

    expect(mockUpdateMenu).toHaveBeenCalled();
  });

  it('allows reordering menus using Move down and Move up in options menu', async () => {
    const menu2 = {
      id: 2,
      title: 'Second Menu',
      description: 'Second lunch plan',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    mockUseMenusQuery.mockReturnValue({
      data: [menu, menu2],
      isLoading: false,
    } as unknown as ReturnType<typeof useMenusQuery>);

    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );

    const moreOptionsBtns = screen.getAllByRole('button', { name: /More options/i });

    // Open options on first menu
    fireEvent.click(moreOptionsBtns[0]);
    const moveDownBtn = screen.getByText('Move down');
    expect(moveDownBtn).toBeInTheDocument();
    fireEvent.click(moveDownBtn);

    expect(mockUpdateMenu).toHaveBeenCalled();
  });

  it('allows touch / pointer dragging using the grip handle to reorder menus', () => {
    const menu2 = {
      id: 2,
      title: 'Second Menu',
      description: 'Second lunch plan',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    mockUseMenusQuery.mockReturnValue({
      data: [menu, menu2],
      isLoading: false,
    } as unknown as ReturnType<typeof useMenusQuery>);

    render(
      <MemoryRouter>
        <Menu />
      </MemoryRouter>,
    );

    const gripButtons = screen.getAllByTitle('Drag to reorder');
    expect(gripButtons).toHaveLength(2);

    // Mock pointer capture methods on elements
    window.HTMLElement.prototype.setPointerCapture = jest.fn();
    window.HTMLElement.prototype.releasePointerCapture = jest.fn();

    const cards = screen.getAllByRole('button', { name: /More options/i }).map((btn) => btn.closest('[data-menu-index]')!);
    document.elementFromPoint = jest.fn().mockReturnValue(cards[1]);

    fireEvent.pointerDown(gripButtons[0], { pointerId: 1, button: 0, pointerType: 'touch' });
    fireEvent.pointerMove(gripButtons[0], { pointerId: 1, clientX: 50, clientY: 200 });
    fireEvent.pointerUp(gripButtons[0], { pointerId: 1 });

    expect(mockUpdateMenu).toHaveBeenCalled();
  });
});

