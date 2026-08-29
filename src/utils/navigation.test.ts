import { navigateBack } from './navigation';

describe('navigateBack utility', () => {
  const mockNavigate = jest.fn();
  const originalHistory = window.history;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'history', {
      value: originalHistory,
      writable: true,
    });
  });

  it('calls navigate(-1) when window.history.state.idx is greater than 0', () => {
    Object.defineProperty(window, 'history', {
      value: {
        state: { idx: 1 },
        length: 2,
      },
      writable: true,
    });

    navigateBack(mockNavigate, '/fallback');
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls navigate(-1) when window.history.length is greater than 1 and state.idx is not defined', () => {
    Object.defineProperty(window, 'history', {
      value: {
        state: null,
        length: 3,
      },
      writable: true,
    });

    navigateBack(mockNavigate, '/fallback');
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls navigate(fallbackUrl) when window.history.state.idx is 0 and length is 1', () => {
    Object.defineProperty(window, 'history', {
      value: {
        state: { idx: 0 },
        length: 1,
      },
      writable: true,
    });

    navigateBack(mockNavigate, '/fallback');
    expect(mockNavigate).toHaveBeenCalledWith('/fallback');
  });

  it('defaults fallback URL to "/" if none provided and no history', () => {
    Object.defineProperty(window, 'history', {
      value: {
        state: { idx: 0 },
        length: 1,
      },
      writable: true,
    });

    navigateBack(mockNavigate);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
