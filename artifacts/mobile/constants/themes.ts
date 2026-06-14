export type ThemeId = "dark_purple" | "midnight" | "aurora" | "ember" | "forest" | "light";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  destructive: string;
  destructiveForeground: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  success: string;
  surface: string;
  tint: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  dark: boolean;
  colors: ThemeColors;
  gradients: {
    header: readonly [string, string, ...string[]];
    hero: readonly [string, string, ...string[]];
    primary: readonly [string, string];
    card: readonly [string, string];
  };
  radius: number;
}

export const THEMES: Record<ThemeId, Theme> = {
  dark_purple: {
    id: "dark_purple",
    name: "Dark Purple",
    emoji: "🔮",
    dark: true,
    colors: {
      background: "#080618",
      foreground: "#EDE8FF",
      card: "#120a2d",
      cardForeground: "#EDE8FF",
      primary: "#9B59F5",
      primaryForeground: "#FFFFFF",
      secondary: "#1e1050",
      secondaryForeground: "#C8B8FF",
      muted: "#1a0e42",
      mutedForeground: "#9B8EC4",
      accent: "#7C3AED",
      accentForeground: "#FFFFFF",
      border: "#2d1f6e",
      input: "#2d1f6e",
      destructive: "#E63946",
      destructiveForeground: "#FFFFFF",
      calories: "#FF6B6B",
      protein: "#74B9FF",
      carbs: "#FDCB6E",
      fats: "#FD79A8",
      success: "#00B894",
      surface: "#150d38",
      tint: "#9B59F5",
    },
    gradients: {
      header: ["#0d0533", "#1a0950", "#080618"],
      hero: ["#4a0080", "#2d006a", "#1a0533"],
      primary: ["#7C3AED", "#9B59F5"],
      card: ["#1e1050", "#120a2d"],
    },
    radius: 16,
  },

  midnight: {
    id: "midnight",
    name: "Midnight",
    emoji: "🌊",
    dark: true,
    colors: {
      background: "#020b18",
      foreground: "#E0F2FE",
      card: "#061225",
      cardForeground: "#E0F2FE",
      primary: "#38BDF8",
      primaryForeground: "#020b18",
      secondary: "#0a2040",
      secondaryForeground: "#BAE6FD",
      muted: "#0c1e35",
      mutedForeground: "#7CB9E8",
      accent: "#0284C7",
      accentForeground: "#FFFFFF",
      border: "#0f2d4a",
      input: "#0f2d4a",
      destructive: "#E63946",
      destructiveForeground: "#FFFFFF",
      calories: "#FB923C",
      protein: "#60A5FA",
      carbs: "#FCD34D",
      fats: "#F472B6",
      success: "#34D399",
      surface: "#071a30",
      tint: "#38BDF8",
    },
    gradients: {
      header: ["#020b18", "#041830", "#061225"],
      hero: ["#0369A1", "#0284C7", "#0EA5E9"],
      primary: ["#0284C7", "#38BDF8"],
      card: ["#0a2040", "#061225"],
    },
    radius: 16,
  },

  aurora: {
    id: "aurora",
    name: "Aurora",
    emoji: "✨",
    dark: true,
    colors: {
      background: "#050014",
      foreground: "#FFE4FF",
      card: "#100028",
      cardForeground: "#FFE4FF",
      primary: "#E879F9",
      primaryForeground: "#050014",
      secondary: "#200040",
      secondaryForeground: "#F0ABFC",
      muted: "#1a0035",
      mutedForeground: "#C084FC",
      accent: "#A855F7",
      accentForeground: "#FFFFFF",
      border: "#300060",
      input: "#300060",
      destructive: "#F43F5E",
      destructiveForeground: "#FFFFFF",
      calories: "#FB7185",
      protein: "#818CF8",
      carbs: "#FBBF24",
      fats: "#34D399",
      success: "#10B981",
      surface: "#150030",
      tint: "#E879F9",
    },
    gradients: {
      header: ["#050014", "#150030", "#200040"],
      hero: ["#7C3AED", "#C026D3", "#E879F9"],
      primary: ["#A855F7", "#E879F9"],
      card: ["#200040", "#100028"],
    },
    radius: 16,
  },

  ember: {
    id: "ember",
    name: "Ember",
    emoji: "🔥",
    dark: true,
    colors: {
      background: "#100500",
      foreground: "#FFF1E6",
      card: "#1f0a00",
      cardForeground: "#FFF1E6",
      primary: "#F97316",
      primaryForeground: "#100500",
      secondary: "#2d1000",
      secondaryForeground: "#FDBA74",
      muted: "#251000",
      mutedForeground: "#D97706",
      accent: "#EF4444",
      accentForeground: "#FFFFFF",
      border: "#3d1800",
      input: "#3d1800",
      destructive: "#DC2626",
      destructiveForeground: "#FFFFFF",
      calories: "#FB923C",
      protein: "#FBBF24",
      carbs: "#FDE68A",
      fats: "#F87171",
      success: "#6EE7B7",
      surface: "#1a0800",
      tint: "#F97316",
    },
    gradients: {
      header: ["#1f0a00", "#3d1800", "#100500"],
      hero: ["#991B1B", "#C2410C", "#EA580C"],
      primary: ["#DC2626", "#F97316"],
      card: ["#2d1000", "#1f0a00"],
    },
    radius: 16,
  },

  forest: {
    id: "forest",
    name: "Forest",
    emoji: "🌿",
    dark: true,
    colors: {
      background: "#0B1612",
      foreground: "#E8F5EE",
      card: "#152320",
      cardForeground: "#E8F5EE",
      primary: "#52B788",
      primaryForeground: "#0B1612",
      secondary: "#1B3A2E",
      secondaryForeground: "#C8E6D4",
      muted: "#1B3A2E",
      mutedForeground: "#7DB899",
      accent: "#2D6A4F",
      accentForeground: "#E8F5EE",
      border: "#1E4034",
      input: "#1E4034",
      destructive: "#E63946",
      destructiveForeground: "#FFFFFF",
      calories: "#FF8C5A",
      protein: "#6B7FEE",
      carbs: "#FF5CAA",
      fats: "#FFD23F",
      success: "#69DB7C",
      surface: "#152320",
      tint: "#52B788",
    },
    gradients: {
      header: ["#0B1612", "#1B3A2E", "#0B1612"],
      hero: ["#1B4332", "#2D6A4F", "#40916C"],
      primary: ["#2D6A4F", "#52B788"],
      card: ["#1B3A2E", "#152320"],
    },
    radius: 16,
  },

  light: {
    id: "light",
    name: "Light",
    emoji: "☀️",
    dark: false,
    colors: {
      background: "#F4FBF7",
      foreground: "#0D1F15",
      card: "#FFFFFF",
      cardForeground: "#0D1F15",
      primary: "#2D6A4F",
      primaryForeground: "#FFFFFF",
      secondary: "#E8F5EE",
      secondaryForeground: "#1B4332",
      muted: "#EBF5F0",
      mutedForeground: "#6B8C7A",
      accent: "#52B788",
      accentForeground: "#FFFFFF",
      border: "#D1E9DB",
      input: "#D1E9DB",
      destructive: "#E63946",
      destructiveForeground: "#FFFFFF",
      calories: "#FF6B35",
      protein: "#4361EE",
      carbs: "#F72585",
      fats: "#FFBA08",
      success: "#40C057",
      surface: "#F0FAF5",
      tint: "#2D6A4F",
    },
    gradients: {
      header: ["#2D6A4F", "#40916C", "#74C69D"],
      hero: ["#74C69D", "#52B788", "#2D6A4F"],
      primary: ["#2D6A4F", "#52B788"],
      card: ["#E8F5EE", "#F4FBF7"],
    },
    radius: 16,
  },
};
