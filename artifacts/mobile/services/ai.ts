import { fetch } from "expo/fetch";

const getBase = () =>
  process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
    : "http://localhost:80";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error: string };
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
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

export interface MealPlanDay {
  day: string;
  meals: {
    breakfast: { name: string; calories: number };
    lunch: { name: string; calories: number };
    dinner: { name: string; calories: number };
    snack: { name: string; calories: number };
  };
}

export async function analyzeIngredients(imageBase64: string): Promise<Ingredient[]> {
  const result = await post<{ ingredients: Ingredient[] }>("/api/ai/analyze-ingredients", {
    imageBase64,
  });
  return result.ingredients ?? [];
}

export async function analyzeNutrition(imageBase64: string): Promise<NutritionResult> {
  return post<NutritionResult>("/api/ai/analyze-nutrition", { imageBase64 });
}

export async function generateRecipes(
  ingredients: string[],
  servings?: number,
  dietary?: string
): Promise<Recipe[]> {
  const result = await post<{ recipes: Recipe[] }>("/api/ai/generate-recipes", {
    ingredients,
    servings,
    dietary,
  });
  return result.recipes ?? [];
}

export async function generateMealPlan(opts: {
  goal?: string;
  duration?: string;
  calories?: number;
  dietary?: string;
}): Promise<MealPlanDay[]> {
  const result = await post<{ plan: MealPlanDay[] }>("/api/ai/meal-plan", opts);
  return result.plan ?? [];
}

export async function streamChat(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const res = await fetch(`${getBase()}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!res.body) {
      onError("No response stream");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6)) as {
              content?: string;
              done?: boolean;
              error?: string;
            };
            if (data.content) onChunk(data.content);
            if (data.done) onDone();
            if (data.error) onError(data.error);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err: unknown) {
    onError(err instanceof Error ? err.message : "Connection failed");
  }
}
