import { renderHook, act } from '@testing-library/react';
import { usePwaInstall, type BeforeInstallPromptEvent } from './usePwaInstall';

describe('usePwaInstall hook', () => {
  it('captures beforeinstallprompt event and triggers promptInstall', async () => {
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.isInstalled).toBe(false);

    const mockPrompt = jest.fn().mockResolvedValue(undefined);
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' });

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
    event.prompt = mockPrompt;
    Object.defineProperty(event, 'userChoice', { value: mockUserChoice });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(outcome).toBe('accepted');
    expect(result.current.isInstalled).toBe(true);
  });

  it('falls back to guide when beforeinstallprompt is not received within timeout', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => usePwaInstall());

    let outcomePromise: Promise<string>;
    act(() => {
      outcomePromise = result.current.promptInstall();
    });

    // Advance past the 800ms wait window
    act(() => {
      jest.advanceTimersByTime(850);
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await outcomePromise;
    });

    expect(outcome).toBe('guide');
    expect(result.current.isGuideOpen).toBe(true);
    jest.useRealTimers();
  });
});
