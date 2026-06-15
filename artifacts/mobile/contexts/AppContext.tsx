import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female" | "other";
  goal: "lose" | "maintain" | "gain" | "muscle";
  dietary: string[];
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  waterGoal: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
}

export interface DailyLog {
  date: string;
  entries: FoodEntry[];
  water: number;
}

export interface Ingredient {
  name: string;
  quantity: string | null;
  confidence: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface NutritionInfo {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  prepTime: number;
  cookTime: number;
  calories: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tips: string[];
  nutritionInfo: NutritionInfo;
  imageUrl: string;
}

export interface NutritionResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  nutritionScore: number;
  healthRating: string;
}

interface AppContextType {
  profile: UserProfile;
  updateProfile: (p: Partial<UserProfile>) => void;
  todayLog: DailyLog;
  addFoodEntry: (entry: Omit<FoodEntry, "id" | "time">) => void;
  addWater: (glasses: number) => void;
  scannedIngredients: Ingredient[];
  setScannedIngredients: (ing: Ingredient[]) => void;
  generatedRecipes: Recipe[];
  setGeneratedRecipes: (r: Recipe[]) => void;
  savedRecipes: Recipe[];
  saveRecipe: (r: Recipe) => void;
  unsaveRecipe: (id: string) => void;
  isRecipeSaved: (id: string) => boolean;
  lastNutrition: NutritionResult | null;
  setLastNutrition: (n: NutritionResult | null) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  age: 28,
  height: 170,
  weight: 70,
  gender: "other",
  goal: "maintain",
  dietary: [],
  calorieGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 225,
  fatsGoal: 65,
  waterGoal: 8,
};

const todayDate = () => new Date().toISOString().split("T")[0];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [todayLog, setTodayLog] = useState<DailyLog>({ date: todayDate(), entries: [], water: 0 });
  const [scannedIngredients, setScannedIngredients] = useState<Ingredient[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [lastNutrition, setLastNutrition] = useState<NutritionResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, log, saved] = await Promise.all([
          AsyncStorage.getItem("ingrivio_profile"),
          AsyncStorage.getItem(`ingrivio_log_${todayDate()}`),
          AsyncStorage.getItem("ingrivio_saved_recipes"),
        ]);
        if (p) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(p) });
        if (log) setTodayLog(JSON.parse(log));
        if (saved) setSavedRecipes(JSON.parse(saved));
      } catch {}
    })();
  }, []);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem("ingrivio_profile", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addFoodEntry = useCallback((entry: Omit<FoodEntry, "id" | "time">) => {
    setTodayLog((prev) => {
      const next = {
        ...prev,
        entries: [
          ...prev.entries,
          {
            ...entry,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      };
      AsyncStorage.setItem(`ingrivio_log_${todayDate()}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addWater = useCallback((glasses: number) => {
    setTodayLog((prev) => {
      const next = { ...prev, water: prev.water + glasses };
      AsyncStorage.setItem(`ingrivio_log_${todayDate()}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const saveRecipe = useCallback((recipe: Recipe) => {
    setSavedRecipes((prev) => {
      if (prev.find((r) => r.id === recipe.id)) return prev;
      const next = [recipe, ...prev];
      AsyncStorage.setItem("ingrivio_saved_recipes", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const unsaveRecipe = useCallback((id: string) => {
    setSavedRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem("ingrivio_saved_recipes", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isRecipeSaved = useCallback(
    (id: string) => savedRecipes.some((r) => r.id === id),
    [savedRecipes]
  );

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        todayLog,
        addFoodEntry,
        addWater,
        scannedIngredients,
        setScannedIngredients,
        generatedRecipes,
        setGeneratedRecipes,
        savedRecipes,
        saveRecipe,
        unsaveRecipe,
        isRecipeSaved,
        lastNutrition,
        setLastNutrition,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
