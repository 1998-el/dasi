import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light'

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void
}


const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'maat-theme'

function applyTheme(_mode: ThemeMode) {
  // Forcer le thème clair partout (retire tout data-theme)
  const html = document.documentElement
  html.removeAttribute('data-theme')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. État initial en mode clair
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    // Forcer clair: on ignore toute valeur stockée
    setThemeState('light');
    applyTheme('light');
    window.localStorage.setItem(STORAGE_KEY, 'light');
  }, []);

  const setTheme = (_t: ThemeMode) => {
    // no-op (clair forcé)
    setThemeState('light');
    window.localStorage.setItem(STORAGE_KEY, 'light');
    applyTheme('light');
  };

  const toggleTheme = () => setTheme('light');


  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

