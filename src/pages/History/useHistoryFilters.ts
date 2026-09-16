import { useReducer, useMemo } from 'react';
import type { WeeklyHistoryFilterParams } from '../../api/Services/MealSelectionServices';

export interface HistoryFilterState {
  page: number;
  limit: number;
  startYear: string;
  startWeek: string;
  endYear: string;
  endWeek: string;
  order: 'desc' | 'asc';
}

type FilterAction =
  | { type: 'SET_FIELD'; field: 'startYear' | 'startWeek' | 'endYear' | 'endWeek' | 'order' | 'limit'; value: string | number }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_QUICK_RANGE'; limit: number }
  | { type: 'RESET_FILTERS' };

const initialFilterState: HistoryFilterState = {
  page: 1,
  limit: 20,
  startYear: '',
  startWeek: '',
  endYear: '',
  endWeek: '',
  order: 'desc',
};

function historyFilterReducer(
  state: HistoryFilterState,
  action: FilterAction,
): HistoryFilterState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        page: 1,
      };
    case 'SET_PAGE':
      return {
        ...state,
        page: action.page,
      };
    case 'SET_QUICK_RANGE':
      return {
        ...initialFilterState,
        limit: action.limit,
      };
    case 'RESET_FILTERS':
      return initialFilterState;
    default:
      return state;
  }
}

export function useHistoryFilters() {
  const [state, dispatch] = useReducer(historyFilterReducer, initialFilterState);

  const filterParams: WeeklyHistoryFilterParams = useMemo(() => {
    const params: WeeklyHistoryFilterParams = {
      page: state.page,
      limit: state.limit,
      order: state.order,
    };
    if (state.startYear) params.startYear = Number(state.startYear);
    if (state.startWeek) params.startWeek = Number(state.startWeek);
    if (state.endYear) params.endYear = Number(state.endYear);
    if (state.endWeek) params.endWeek = Number(state.endWeek);
    return params;
  }, [state]);

  const hasActiveFilters = Boolean(
    state.startYear ||
      state.startWeek ||
      state.endYear ||
      state.endWeek ||
      state.order !== 'desc' ||
      state.limit !== 20,
  );

  return {
    state,
    filterParams,
    hasActiveFilters,
    setField: (field: 'startYear' | 'startWeek' | 'endYear' | 'endWeek' | 'order' | 'limit', value: string | number) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    setPage: (page: number) => dispatch({ type: 'SET_PAGE', page }),
    setQuickRange: (limit: number) => dispatch({ type: 'SET_QUICK_RANGE', limit }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
  };
}
