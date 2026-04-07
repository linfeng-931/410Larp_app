import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStyles } from './styleFormat';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState(systemColorScheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user_theme');
        if (savedTheme !== null) {
          setModeState(savedTheme);
        }
      } catch (e) {
        console.error('讀取主題失敗', e);
      }
    };
    loadTheme();
  }, []);

  const setMode = async (newMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem('user_theme', newMode);
    } catch (e) {
      console.error('儲存主題失敗', e);
    }
  };

  const isLight = mode === 'light';
  const styles = getStyles(mode);

  return (
    <ThemeContext.Provider value={{ styles, isLight, colorScheme: mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useAppStyles() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('必須在 ThemeProvider 內使用');
  return context;
}