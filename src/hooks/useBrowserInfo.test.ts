import { renderHook } from '@testing-library/react';
import { useBrowserInfo } from './useBrowserInfo';

describe('useBrowserInfo hook', () => {
  const originalNavigator = window.navigator;

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('detects Chrome browser and desktop OS accurately', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        platform: 'Win32',
        maxTouchPoints: 0,
      },
      writable: true,
    });

    const { result } = renderHook(() => useBrowserInfo());

    expect(result.current.name).toBe('Chrome');
    expect(result.current.os).toBe('Windows');
    expect(result.current.canPromptNativeInstall).toBe(true);
    expect(result.current.pushRequiresPwaFirst).toBe(false);
  });

  it('detects iOS Safari and flags pushRequiresPwaFirst when not standalone', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 5,
        standalone: false,
      },
      writable: true,
    });

    const { result } = renderHook(() => useBrowserInfo());

    expect(result.current.name).toBe('Safari');
    expect(result.current.os).toBe('iOS');
    expect(result.current.installMethod).toBe('ios-share');
    expect(result.current.pushRequiresPwaFirst).toBe(true);
  });
});
