import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const ACCENT_PRESETS = [
  { name: 'Pine', value: '#1F5F4D' },
  { name: 'Gold', value: '#D9A441' },
  { name: 'Berry', value: '#A63A50' },
  { name: 'Moss', value: '#4F8B76' }
];

export const BACKGROUND_PRESETS = {
  light: [
    { name: 'Paper', value: '#F1EEE6' },
    { name: 'Sand', value: '#F2E9DC' },
    { name: 'Sage', value: '#EDEFE4' }
  ],
  dark: [
    { name: 'Ink', value: '#12140F' },
    { name: 'Espresso', value: '#171310' },
    { name: 'Forest', value: '#10160F' }
  ]
};

const STORAGE_KEYS = {
  mode: 'ahsan_chat_theme_mode',
  accent: 'ahsan_chat_theme_accent',
  background: 'ahsan_chat_theme_bg'
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value || fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => readStored(STORAGE_KEYS.mode, 'light'));
  // null means "use the mode's default" rather than a user override.
  const [accent, setAccent] = useState(() => readStored(STORAGE_KEYS.accent, ''));
  const [background, setBackground] = useState(() => readStored(STORAGE_KEYS.background, ''));

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    localStorage.setItem(STORAGE_KEYS.mode, mode);

    if (accent) {
      root.style.setProperty('--color-accent', accent);
    } else {
      root.style.removeProperty('--color-accent');
    }

    if (background) {
      root.style.setProperty('--color-bg', background);
    } else {
      root.style.removeProperty('--color-bg');
    }
  }, [mode, accent, background]);

  function updateAccent(value) {
    setAccent(value);
    localStorage.setItem(STORAGE_KEYS.accent, value || '');
  }

  function updateBackground(value) {
    setBackground(value);
    localStorage.setItem(STORAGE_KEYS.background, value || '');
  }

  function toggleMode() {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function resetCustomColors() {
    updateAccent('');
    updateBackground('');
  }

  const value = useMemo(
    () => ({
      mode,
      accent,
      background,
      setMode,
      toggleMode,
      setAccent: updateAccent,
      setBackground: updateBackground,
      resetCustomColors
    }),
    [mode, accent, background]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
