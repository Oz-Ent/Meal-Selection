import { createContext, useEffect, useState, type FC, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Temporary style injection to disable transitions during theme switch, preventing visual tearing/glitch
function disableTransitionsTemporarily() {
  if (typeof document === 'undefined') return;
  const css = document.createElement('style');
  css.appendChild(
    document.createTextNode(
      `*, *::before, *::after {
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -ms-transition: none !important;
        transition: none !important;
      }`
    )
  );
  document.head.appendChild(css);
  // Force synchronous reflow so transition suppression takes effect immediately
  void window.getComputedStyle(document.body).opacity;
  setTimeout(() => {
    if (document.head.contains(css)) {
      document.head.removeChild(css);
    }
  }, 100);
}

function computeIsDark(targetTheme: Theme): boolean {
  if (targetTheme === 'dark') return true;
  if (targetTheme === 'system') {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
  return false;
}

function applyThemeToDOM(targetTheme: Theme, suppressTransitions = false) {
  if (typeof document === 'undefined') return;
  if (suppressTransitions) {
    disableTransitionsTemporarily();
  }
  const isDark = computeIsDark(targetTheme);
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('meal_app_theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        applyThemeToDOM(savedTheme, false);
        return savedTheme;
      }
    } catch {
      // fallback
    }
    applyThemeToDOM('light', false);
    return 'light';
  });

  useEffect(() => {
    applyThemeToDOM(theme, false);

    try {
      localStorage.setItem('meal_app_theme', theme);
    } catch {
      // fallback
    }

    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyThemeToDOM('system', true);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    // 1. Immediately suppress transitions and update DOM synchronously
    applyThemeToDOM(newTheme, true);

    // 2. Immediately persist to localStorage
    try {
      localStorage.setItem('meal_app_theme', newTheme);
    } catch {
      // fallback
    }

    // 3. Update React state
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;