import { getAnalytics, logEvent, type Analytics } from "firebase/analytics";
import { app } from "./config";

let analytics: Analytics | null = null;

try {
  analytics = getAnalytics(app);
} catch {
  // Analytics not available (e.g., ad blockers, no web context)
}

export function logAppEvent(eventName: string, params?: Record<string, unknown>): void {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

export function logScreenView(screenName: string, screenClass?: string): void {
  logAppEvent("screen_view", {
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
}

export function logLogin(method: string): void {
  logAppEvent("login", { method });
}

export function logSignUp(method: string): void {
  logAppEvent("sign_up", { method });
}

export function logRecipeGenerated(recipeName: string): void {
  logAppEvent("recipe_generated", { recipe_name: recipeName });
}

export function logFoodScanned(mode: string): void {
  logAppEvent("food_scanned", { mode });
}

export function logMealLogged(meal: string): void {
  logAppEvent("meal_logged", { meal });
}
