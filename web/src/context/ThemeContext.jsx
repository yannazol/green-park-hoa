/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from 'react';
import { getThemeColors, fontFamily } from '../constants/theme';

export const ThemeContext = createContext(null);

function getSystemScheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light'); // 'light' | 'dark' | 'system'
  const colors = useMemo(() => getThemeColors(mode, getSystemScheme()), [mode]);

  useEffect(() => {
    document.body.style.backgroundColor = colors.bg;
    document.body.style.color = colors.text;
    document.body.style.fontFamily = fontFamily;
  }, [colors]);

  const value = useMemo(() => ({ colors, mode, setMode }), [colors, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}