import { createContext, useContext, useState } from "react";

const themes = {
  blue: {
    button:       '#1eaed4',
    buttonDeep:   '#1596b8',
    surface:      '#FFFFFF',
    surfaceAlt:   '#f4fafd',
    surfaceDeep:  '#eaf6fb',
    text:         '#06101f',
    textMuted:    '#6B7898',
    textLight:    '#1eaed4',
    accent:       '#ddf3fc',
    accentStrong: '#b8e9fa',
    border:       'rgba(0, 30, 100, 0.07)',
    borderAccent: 'rgba(30, 174, 212, 0.20)',
    borderStrong: 'rgba(30, 174, 212, 0.35)',
  },
  purple: {
    button:       '#7c3aed',
    buttonDeep:   '#6d28d9',
    surface:      '#FFFFFF',
    surfaceAlt:   '#faf7ff',
    surfaceDeep:  '#f3eeff',
    text:         '#0f0520',
    textMuted:    '#6B7898',
    textLight:    '#7c3aed',
    accent:       '#ede9fe',
    accentStrong: '#ddd6fe',
    border:       'rgba(60, 0, 120, 0.07)',
    borderAccent: 'rgba(124, 58, 237, 0.20)',
    borderStrong: 'rgba(124, 58, 237, 0.35)',
  },
  green: {
    button:       '#059669',
    buttonDeep:   '#047857',
    surface:      '#FFFFFF',
    surfaceAlt:   '#f0fdf8',
    surfaceDeep:  '#dcfce7',
    text:         '#052015',
    textMuted:    '#6B7898',
    textLight:    '#059669',
    accent:       '#d1fae5',
    accentStrong: '#a7f3d0',
    border:       'rgba(0, 60, 30, 0.07)',
    borderAccent: 'rgba(5, 150, 105, 0.20)',
    borderStrong: 'rgba(5, 150, 105, 0.35)',
  },
  orange: {
    button:       '#ea580c',
    buttonDeep:   '#c2410c',
    surface:      '#FFFFFF',
    surfaceAlt:   '#fff8f4',
    surfaceDeep:  '#fff1e6',
    text:         '#1c0a00',
    textMuted:    '#6B7898',
    textLight:    '#ea580c',
    accent:       '#ffedd5',
    accentStrong: '#fed7aa',
    border:       'rgba(100, 30, 0, 0.07)',
    borderAccent: 'rgba(234, 88, 12, 0.20)',
    borderStrong: 'rgba(234, 88, 12, 0.35)',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("blue");

  return (
    <ThemeContext.Provider value={{ colors: themes[themeName], themeName, setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}