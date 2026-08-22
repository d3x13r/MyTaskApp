import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#0F172A',
  subText: '#64748B',
  border: '#E2E8F0',
  primary: '#FFCC00',
  textOnPrimary: '#181818',
  inputBg: '#F8FAFC',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FEE2E2',
  dangerText: '#EF4444',
};

const darkColors = {
  background: '#000000', // Истинско чисто черно
  card: '#121212',       // Тъмно сиво за карти
  text: '#FFFFFF',
  subText: '#A0A0A0',
  border: '#222222',
  primary: '#FFCC00',
  textOnPrimary: '#181818',
  inputBg: '#1A1A1A',
  dangerBg: '#2C0B0B',
  dangerBorder: '#450A0A',
  dangerText: '#F87171',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};