import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { THEMES, type Theme, type ThemeId } from "@/constants/themes";

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const defaultTheme = THEMES.dark_purple;
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  themeId: "dark_purple",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("dark_purple");

  useEffect(() => {
    AsyncStorage.getItem("ingrivio_theme")
      .then((id) => {
        if (id && id in THEMES) setThemeId(id as ThemeId);
      })
      .catch(() => {});
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    AsyncStorage.setItem("ingrivio_theme", id).catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
