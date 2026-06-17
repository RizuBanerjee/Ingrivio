import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { savedRecipesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/saved-recipes?userId=xxx
router.get("/saved-recipes", async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "Missing userId" });
    return;
  }
  try {
    const rows = await db.select().from(savedRecipesTable).where(eq(savedRecipesTable.userId, userId)).orderBy(savedRecipesTable.createdAt);
    const recipes = rows.map((r) => ({
      id: r.recipeId,
      name: r.name,
      description: r.description,
      difficulty: r.difficulty,
      prepTime: Number(r.prepTime),
      cookTime: Number(r.cookTime),
      calories: Number(r.calories),
      servings: Number(r.servings),
      ingredients: r.ingredients,
      instructions: r.instructions ?? [],
      tips: r.tips ?? [],
      nutritionInfo: r.nutritionInfo,
      imageUrl: r.imageUrl,
    }));
    res.json({ recipes });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch saved recipes" });
  }
});

// POST /api/saved-recipes
router.post("/saved-recipes", async (req, res) => {
  const { userId, recipe } = req.body;
  if (!userId || !recipe || !recipe.id) {
    res.status(400).json({ error: "Missing userId or recipe" });
    return;
  }
  try {
    await db.insert(savedRecipesTable).values({
      userId,
      recipeId: recipe.id,
      name: recipe.name,
      description: recipe.description,
      difficulty: recipe.difficulty,
      prepTime: String(recipe.prepTime),
      cookTime: String(recipe.cookTime),
      calories: String(recipe.calories),
      servings: String(recipe.servings),
      ingredients: recipe.ingredients,
      instructions: recipe.instructions ?? [],
      tips: recipe.tips ?? [],
      nutritionInfo: recipe.nutritionInfo,
      imageUrl: recipe.imageUrl,
    }).onConflictDoNothing();
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to save recipe" });
  }
});

// DELETE /api/saved-recipes?userId=xxx&recipeId=xxx
router.delete("/saved-recipes", async (req, res) => {
  const { userId, recipeId } = req.query;
  if (!userId || typeof userId !== "string" || !recipeId || typeof recipeId !== "string") {
    res.status(400).json({ error: "Missing userId or recipeId" });
    return;
  }
  try {
    await db.delete(savedRecipesTable).where(
      and(eq(savedRecipesTable.userId, userId), eq(savedRecipesTable.recipeId, recipeId))
    );
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete saved recipe" });
  }
});

export default router;
