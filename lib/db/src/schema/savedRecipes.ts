import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedRecipesTable = pgTable("saved_recipes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipeId: text("recipe_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  prepTime: text("prep_time").notNull(),
  cookTime: text("cook_time").notNull(),
  calories: text("calories").notNull(),
  servings: text("servings").notNull(),
  ingredients: jsonb("ingredients").notNull().$type<{ name: string; amount: string }[]>(),
  instructions: text("instructions").array(),
  tips: text("tips").array(),
  nutritionInfo: jsonb("nutrition_info").notNull().$type<{
    protein: number; carbs: number; fats: number; fiber: number;
  }>(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const insertSavedRecipeSchema = createInsertSchema(savedRecipesTable).omit({ id: true, createdAt: true });
export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type SavedRecipeRow = typeof savedRecipesTable.$inferSelect;
