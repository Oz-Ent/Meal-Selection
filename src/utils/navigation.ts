import type { NavigateFunction } from 'react-router-dom';

/**
 * Dynamically navigates back to the previous page if history exists,
 * otherwise navigates to the provided fallback URL (defaults to '/').
 */
export function navigateBack(navigate: NavigateFunction, fallbackUrl: string = '/') {
  if (
    typeof window !== 'undefined' &&
    window.history?.state &&
    typeof window.history.state.idx === 'number' &&
    window.history.state.idx > 0
  ) {
    navigate(-1);
  } else if (
    typeof window !== 'undefined' &&
    window.history &&
    typeof window.history.length === 'number' &&
    window.history.length > 1
  ) {
    navigate(-1);
  } else {
    navigate(fallbackUrl);
  }
}
