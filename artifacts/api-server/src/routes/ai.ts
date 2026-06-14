import { Router } from "express";
import OpenAI from "openai";

const router = Router();

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  return new OpenAI({ apiKey });
}

function parseJSON(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gm, "").trim();
  return JSON.parse(cleaned);
}

router.post("/ai/analyze-ingredients", async (req, res) => {
  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 required" });
      return;
    }
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "low" },
            },
            {
              type: "text",
              text: 'Identify all visible food ingredients. Return only valid JSON:\n{"ingredients":[{"name":"string","quantity":"string or null","confidence":0.95}]}',
            },
          ],
        },
      ],
    });
    const content = response.choices[0]?.message?.content ?? '{"ingredients":[]}';
    try {
      res.json(parseJSON(content));
    } catch {
      res.json({ ingredients: [] });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "OPENAI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add your OPENAI_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to analyze ingredients" });
  }
});

router.post("/ai/analyze-nutrition", async (req, res) => {
  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 required" });
      return;
    }
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "low" },
            },
            {
              type: "text",
              text: 'Analyze the food in this image. Return only valid JSON:\n{"foodName":"string","calories":350,"protein":25,"carbs":40,"fats":12,"fiber":5,"sugar":8,"sodium":420,"nutritionScore":75,"healthRating":"good"}',
            },
          ],
        },
      ],
    });
    const content = response.choices[0]?.message?.content ?? "{}";
    try {
      res.json(parseJSON(content));
    } catch {
      res.status(500).json({ error: "Could not parse nutrition data" });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "OPENAI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add your OPENAI_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to analyze nutrition" });
  }
});

router.post("/ai/generate-recipes", async (req, res) => {
  try {
    const {
      ingredients,
      servings = 2,
      dietary = "",
    } = req.body as { ingredients: string[]; servings?: number; dietary?: string };
    if (!ingredients?.length) {
      res.status(400).json({ error: "ingredients required" });
      return;
    }
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `Create 3 recipes using: ${ingredients.join(", ")}. Servings: ${servings}.${dietary ? ` Dietary: ${dietary}.` : ""}

Return only valid JSON:
{"recipes":[{"id":"r1","name":"string","description":"string","difficulty":"easy","prepTime":15,"cookTime":20,"calories":450,"servings":${servings},"ingredients":[{"name":"string","amount":"string"}],"instructions":["Step 1..."],"tips":["Tip 1"],"nutritionInfo":{"protein":30,"carbs":45,"fats":15,"fiber":6}}]}`,
        },
      ],
    });
    const content = response.choices[0]?.message?.content ?? '{"recipes":[]}';
    try {
      const parsed = parseJSON(content) as { recipes: Record<string, unknown>[] };
      if (Array.isArray(parsed.recipes)) {
        parsed.recipes = parsed.recipes.map((r, i) => ({
          ...r,
          id: `recipe-${Date.now()}-${i}`,
        }));
      }
      res.json(parsed);
    } catch {
      res.json({ recipes: [] });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "OPENAI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add your OPENAI_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate recipes" });
  }
});

router.post("/ai/meal-plan", async (req, res) => {
  try {
    const {
      goal = "maintain",
      duration = "week",
      calories = 2000,
      dietary = "",
    } = req.body as { goal?: string; duration?: string; calories?: number; dietary?: string };
    const days = duration === "day" ? 1 : duration === "week" ? 7 : 30;
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Create a ${days}-day meal plan. Goal: ${goal}. Target: ~${calories} cal/day.${dietary ? ` Dietary: ${dietary}.` : ""}

Return only valid JSON:
{"plan":[{"day":"Monday","meals":{"breakfast":{"name":"Oatmeal with berries","calories":350},"lunch":{"name":"Grilled chicken salad","calories":520},"dinner":{"name":"Salmon with vegetables","calories":580},"snack":{"name":"Greek yogurt","calories":150}}}]}`,
        },
      ],
    });
    const content = response.choices[0]?.message?.content ?? '{"plan":[]}';
    try {
      res.json(parseJSON(content));
    } catch {
      res.json({ plan: [] });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "OPENAI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add your OPENAI_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
});

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body as {
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
    };
    if (!message) {
      res.status(400).json({ error: "message required" });
      return;
    }
    const openai = getOpenAI();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are Ingrivio's AI nutrition assistant. Help users with nutrition advice, healthy recipes, meal planning, calorie tracking, and food science. Be concise, friendly, and practical. Never give medical diagnoses.",
        },
        ...history.slice(-10),
        { role: "user", content: message },
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "OPENAI_API_KEY not configured") {
      res.write(`data: ${JSON.stringify({ error: "AI not configured. Add your OPENAI_API_KEY in Secrets." })}\n\n`);
      res.end();
      return;
    }
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
