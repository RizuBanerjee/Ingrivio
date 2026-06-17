import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getDailyLog, saveDailyLog, getSavedRecipesFromDB, saveRecipeToDB, deleteSavedRecipeFromDB } from "@/services/ai";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";
import type { UserRow } from "@/services/ai";

export interface UserProfile {
  name: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  gender: "male" | "female" | "other" | "";
  goal: "lose" | "maintain" | "gain" | "muscle" | "";
  dietary: string[];
  calorieGoal: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatsGoal: number | null;
  waterGoal: number | null;
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
  servingAmount?: string;
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
  resetProfile: () => void;
  loadProfileFromUser: (dbUser: UserRow | null) => void;
  todayLog: DailyLog;
  addFoodEntry: (entry: Omit<FoodEntry, "id" | "time">) => void;
  addWater: (glasses: number) => void;
  resetTodayLog: () => void;
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
  getLogForDate: (date: string) => Promise<DailyLog | null>;
}

const BLANK_PROFILE: UserProfile = {
  name: "",
  age: null,
  height: null,
  weight: null,
  gender: "",
  goal: "",
  dietary: [],
  calorieGoal: null,
  proteinGoal: null,
  carbsGoal: null,
  fatsGoal: null,
  waterGoal: null,
};

const todayDate = () => new Date().toISOString().split("T")[0];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(BLANK_PROFILE);
  const [todayLog, setTodayLog] = useState<DailyLog>({ date: todayDate(), entries: [], water: 0 });
  const [scannedIngredients, setScannedIngredients] = useState<Ingredient[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [lastNutrition, setLastNutrition] = useState<NutritionResult | null>(null);

  // Track Firebase auth changes
  useEffect(() => {
    try {
      const auth = getAuth(getApp());
      const unsub = auth.onAuthStateChanged((u) => {
        setUserId(u ? u.uid : null);
      });
      return () => unsub();
    } catch {
      return;
    }
  }, []);

  // Load per-user data when userId changes
  useEffect(() => {
    (async () => {
      try {
        const profileKey = userId ? `ingrivio_profile_${userId}` : "ingrivio_profile_guest";
        const logKey = userId ? `ingrivio_log_${userId}_${todayDate()}` : `ingrivio_log_guest_${todayDate()}`;
        const savedKey = userId ? `ingrivio_saved_recipes_${userId}` : "ingrivio_saved_recipes_guest";

        const [p, log, saved] = await Promise.all([
          AsyncStorage.getItem(profileKey),
          AsyncStorage.getItem(logKey),
          AsyncStorage.getItem(savedKey),
        ]);

        if (p) {
          const parsed = JSON.parse(p);
          setProfile({ ...BLANK_PROFILE, ...parsed });
        } else {
          // No saved profile for this user → show blank
          setProfile(BLANK_PROFILE);
        }

        if (log) {
          setTodayLog(JSON.parse(log));
        } else {
          setTodayLog({ date: todayDate(), entries: [], water: 0 });
        }

        if (saved) {
          setSavedRecipes(JSON.parse(saved));
        } else {
          setSavedRecipes([]);
        }

        // If logged in, try to sync today's log and saved recipes from DB
        if (userId) {
          try {
            const dbLog = await getDailyLog(userId, todayDate());
            if (dbLog && dbLog.entries.length > 0) {
              const merged: DailyLog = {
                date: dbLog.date,
                entries: dbLog.entries,
                water: dbLog.water,
              };
              setTodayLog(merged);
              AsyncStorage.setItem(logKey, JSON.stringify(merged)).catch(() => {});
            }
          } catch {}
          try {
            const dbSaved = await getSavedRecipesFromDB(userId);
            if (dbSaved && dbSaved.recipes.length > 0) {
              setSavedRecipes(dbSaved.recipes);
              AsyncStorage.setItem(savedKey, JSON.stringify(dbSaved.recipes)).catch(() => {});
            }
          } catch {}
        }
      } catch {}
    })();
  }, [userId]);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      const uid = prev.name || "guest"; // We'll use a ref for the key, but setProfile is sync
      return next;
    });
  }, []);

  // Persist profile changes to AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const profileKey = userId ? `ingrivio_profile_${userId}` : "ingrivio_profile_guest";
        await AsyncStorage.setItem(profileKey, JSON.stringify(profile));
      } catch {}
    })();
  }, [profile, userId]);

  // Persist saved recipes
  useEffect(() => {
    (async () => {
      try {
        const savedKey = userId ? `ingrivio_saved_recipes_${userId}` : "ingrivio_saved_recipes_guest";
        await AsyncStorage.setItem(savedKey, JSON.stringify(savedRecipes));
      } catch {}
    })();
  }, [savedRecipes, userId]);

  const resetProfile = useCallback(() => {
    setProfile(BLANK_PROFILE);
    setTodayLog({ date: todayDate(), entries: [], water: 0 });
    setSavedRecipes([]);
    setGeneratedRecipes([]);
    setScannedIngredients([]);
    setLastNutrition(null);
  }, []);

  const loadProfileFromUser = useCallback((dbUser: UserRow | null) => {
    if (!dbUser) {
      setProfile(BLANK_PROFILE);
      return;
    }
    const mapped: UserProfile = {
      name: dbUser.username || "",
      age: dbUser.age ?? null,
      height: dbUser.height ?? null,
      weight: dbUser.weight ?? null,
      gender: (dbUser.gender as any) || "",
      goal: (dbUser.goal as any) || "",
      dietary: dbUser.dietary ?? [],
      calorieGoal: dbUser.calorieGoal ?? null,
      proteinGoal: dbUser.proteinGoal ?? null,
      carbsGoal: dbUser.carbsGoal ?? null,
      fatsGoal: dbUser.fatsGoal ?? null,
      waterGoal: dbUser.waterGoal ?? null,
    };
    setProfile(mapped);
  }, []);

  const syncToDB = useCallback(
    async (log: DailyLog) => {
      if (!userId) return;
      const totalCalories = log.entries.reduce((s, e) => s + e.calories, 0);
      const totalProtein = log.entries.reduce((s, e) => s + e.protein, 0);
      const totalCarbs = log.entries.reduce((s, e) => s + e.carbs, 0);
      const totalFats = log.entries.reduce((s, e) => s + e.fats, 0);
      try {
        await saveDailyLog({
          userId,
          date: log.date,
          entries: log.entries,
          water: log.water,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
        });
      } catch {}
    },
    [userId]
  );

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
      const logKey = userId ? `ingrivio_log_${userId}_${todayDate()}` : `ingrivio_log_guest_${todayDate()}`;
      AsyncStorage.setItem(logKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [userId]);

  // Sync to DB whenever todayLog changes
  useEffect(() => {
    if (todayLog.entries.length > 0 || todayLog.water > 0) {
      syncToDB(todayLog);
    }
  }, [todayLog, syncToDB]);

  const addWater = useCallback((glasses: number) => {
    setTodayLog((prev) => {
      const next = { ...prev, water: prev.water + glasses };
      const logKey = userId ? `ingrivio_log_${userId}_${todayDate()}` : `ingrivio_log_guest_${todayDate()}`;
      AsyncStorage.setItem(logKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [userId]);

  const resetTodayLog = useCallback(() => {
    setTodayLog({ date: todayDate(), entries: [], water: 0 });
  }, []);

  const getLogForDate = useCallback(
    async (date: string): Promise<DailyLog | null> => {
      if (userId) {
        try {
          const dbLog = await getDailyLog(userId, date);
          if (dbLog && dbLog.entries.length > 0) {
            return { date: dbLog.date, entries: dbLog.entries, water: dbLog.water };
          }
        } catch {}
      }
      try {
        const localKey = userId ? `ingrivio_log_${userId}_${date}` : `ingrivio_log_guest_${date}`;
        const local = await AsyncStorage.getItem(localKey);
        if (local) return JSON.parse(local);
      } catch {}
      return null;
    },
    [userId]
  );

  const saveRecipe = useCallback((recipe: Recipe) => {
    setSavedRecipes((prev) => {
      if (prev.find((r) => r.id === recipe.id)) return prev;
      const next = [recipe, ...prev];
      // Sync to DB
      if (userId) {
        saveRecipeToDB(userId, recipe).catch(() => {});
      }
      return next;
    });
  }, [userId]);

  const unsaveRecipe = useCallback((id: string) => {
    setSavedRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      // Sync to DB
      if (userId) {
        deleteSavedRecipeFromDB(userId, id).catch(() => {});
      }
      return next;
    });
  }, [userId]);

  const isRecipeSaved = useCallback(
    (id: string) => savedRecipes.some((r) => r.id === id),
    [savedRecipes]
  );

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        loadProfileFromUser,
        todayLog,
        addFoodEntry,
        addWater,
        resetTodayLog,
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
        getLogForDate,
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
