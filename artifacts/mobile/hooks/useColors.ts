import { useTheme } from "@/contexts/ThemeContext";

/**
 * Returns the design tokens for the current theme.
 * Automatically reflects theme changes from ThemeContext.
 */
export function useColors() {
  const { theme } = useTheme();
  return { ...theme.colors, radius: theme.radius };
}
