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

export interface IngredientNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  serving: string;
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

export async function analyzeNutrition(ingredientsOrImageBase64: string[] | string): Promise<NutritionResult> {
  const body = Array.isArray(ingredientsOrImageBase64)
    ? { ingredients: ingredientsOrImageBase64 }
    : { imageBase64: ingredientsOrImageBase64 };
  return post<NutritionResult>("/api/ai/analyze-nutrition", body);
}

export async function getIngredientNutrition(ingredient: string): Promise<IngredientNutrition> {
  return post<IngredientNutrition>("/api/ai/ingredient-nutrition", { ingredient });
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

export async function getDailyLog(userId: string, date: string): Promise<{
  date: string;
  userId: string;
  entries: FoodEntry[];
  water: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}> {
  const res = await fetch(`${getBase()}/api/daily-logs?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error: string };
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<{
    date: string;
    userId: string;
    entries: FoodEntry[];
    water: number;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  }>;
}

export async function saveDailyLog(body: {
  userId: string;
  date: string;
  entries: FoodEntry[];
  water: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${getBase()}/api/daily-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error: string };
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<{ success: boolean }>;
}

/* ===== User / Social API ===== */

export interface UserRow {
  userId: string;
  firebaseUid: string;
  username: string;
  email: string;
  avatar?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  goal?: string | null;
  dietary?: string[] | null;
  calorieGoal?: number | null;
  proteinGoal?: number | null;
  carbsGoal?: number | null;
  fatsGoal?: number | null;
  waterGoal?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PublicUser {
  userId: string;
  username: string;
  avatar?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  goal?: string | null;
  dietary?: string[] | null;
  calorieGoal?: number | null;
  proteinGoal?: number | null;
  carbsGoal?: number | null;
  fatsGoal?: number | null;
  waterGoal?: number | null;
}

export interface FriendRequestRow {
  id: number;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRow {
  id: number;
  userId: string;
  friendId: string;
  friendUsername: string;
  friendAvatar?: string | null;
  createdAt: string;
}

export interface NotificationRow {
  id: number;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: string | null;
  read: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

export interface DietHistoryEntry {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  water: number;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${getBase()}${path}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error: string };
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function createUser(firebaseUid: string, username: string, email: string): Promise<UserRow> {
  const result = await post<{ user: UserRow }>("/api/users", { firebaseUid, username, email });
  return result.user;
}

export async function getUserByFirebase(firebaseUid: string): Promise<UserRow> {
  const result = await get<{ user: UserRow }>(`/api/users/me?firebaseUid=${encodeURIComponent(firebaseUid)}`);
  return result.user;
}

export async function updateUser(userId: string, updates: Partial<UserRow>): Promise<UserRow> {
  const result = await post<{ user: UserRow }>(`/api/users/${encodeURIComponent(userId)}`, updates);
  return result.user;
}

export async function removeFriend(userId: string, friendId: string): Promise<{ success: boolean }> {
  return post("/api/friends/remove", { userId, friendId });
}

export async function searchUserById(query: string): Promise<{ found: boolean; user?: PublicUser }> {
  const result = await get<{ found: boolean; user?: PublicUser }>(
    `/api/users/search?query=${encodeURIComponent(query)}`
  );
  return result;
}

export async function getPublicUser(userId: string): Promise<PublicUser> {
  const result = await get<{ user: PublicUser }>(`/api/users/${encodeURIComponent(userId)}`);
  return result.user;
}

/* ===== Friend Requests ===== */

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<{ success: boolean; message: string; alreadySent?: boolean; alreadyFriends?: boolean }> {
  return post("/api/friends/request", { senderId, receiverId });
}

export async function acceptFriendRequest(requestId: number, userId: string): Promise<{ success: boolean }> {
  return post("/api/friends/accept", { requestId, userId });
}

export async function rejectFriendRequest(requestId: number, userId: string): Promise<{ success: boolean }> {
  return post("/api/friends/reject", { requestId, userId });
}

export async function getFriendRequests(userId: string): Promise<{ sent: FriendRequestRow[]; received: FriendRequestRow[] }> {
  return get(`/api/friends/requests?userId=${encodeURIComponent(userId)}`);
}

export async function getFriends(userId: string): Promise<{ friends: FriendRow[] }> {
  return get(`/api/friends?userId=${encodeURIComponent(userId)}`);
}

/* ===== Notifications ===== */

export async function getNotifications(userId: string): Promise<{ notifications: NotificationRow[] }> {
  return get(`/api/notifications?userId=${encodeURIComponent(userId)}`);
}

export async function getFriendDietHistory(userId: string, limit?: number): Promise<{ history: DietHistoryEntry[] }> {
  return get(`/api/daily-logs/history?userId=${encodeURIComponent(userId)}&limit=${limit ?? 7}`);
}

export async function getSavedRecipesFromDB(userId: string): Promise<{ recipes: any[] }> {
  return get(`/api/saved-recipes?userId=${encodeURIComponent(userId)}`);
}

export async function saveRecipeToDB(userId: string, recipe: any): Promise<{ success: boolean }> {
  return post("/api/saved-recipes", { userId, recipe });
}

export async function deleteSavedRecipeFromDB(userId: string, recipeId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${getBase()}/api/saved-recipes?userId=${encodeURIComponent(userId)}&recipeId=${encodeURIComponent(recipeId)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete saved recipe");
  return res.json() as Promise<{ success: boolean }>;
}

export async function markNotificationRead(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${getBase()}/api/notifications/${id}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json() as Promise<{ success: boolean }>;
}

export async function markAllNotificationsRead(userId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${getBase()}/api/notifications/read-all?userId=${encodeURIComponent(userId)}`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json() as Promise<{ success: boolean }>;
}

export async function createNotification(userId: string, type: string, title: string, body: string, data?: Record<string, unknown>): Promise<{ notification: NotificationRow }> {
  return post("/api/notifications", { userId, type, title, body, data });
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
