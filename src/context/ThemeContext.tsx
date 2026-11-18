import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeSiteSettings } from '../services/firestoreService';
import type { ThemeMode } from '../types';

const STORAGE_KEY = 'palazzo-theme';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): ThemeMode | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === 'light' || val === 'dark' ? val : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme() || 'dark');
  const [userOverridden, setUserOverridden] = useState<boolean>(() => readStoredTheme() !== null);

  useEffect(() => {
    const unsub = subscribeSiteSettings(
      (settings) => {
        if (!userOverridden && settings?.defaultTheme) {
          setThemeState(settings.defaultTheme);
        }
      },
      () => undefined,
    );
    return () => unsub();
  }, [userOverridden]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#080909' : '#F6F7F6');
    }
  }, [theme]);

  const setTheme = (next: ThemeMode) => {
    setUserOverridden(true);
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failure in private browsing
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
