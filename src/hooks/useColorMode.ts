// src/hooks/useColorMode.ts
import { useEffect, useMemo, useState } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';

export function useColorMode() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    return stored === 'light' || stored === 'dark' ? (stored as 'light'|'dark') : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggle = () => setMode(m => (m === 'light' ? 'dark' : 'light'));

  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#6c5ce7'
      },
      secondary: {
        main: '#a29bfe'
      }
    },
    shape: {
      borderRadius: 10
    }
  }), [mode]);

  return { mode, theme, toggle };
}
