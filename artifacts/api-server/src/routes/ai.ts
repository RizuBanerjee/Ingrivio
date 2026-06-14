import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  return new GoogleGenAI({ apiKey });
}

const MODEL = "gemini-2.5-flash";

function parseJSON(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gm, "").trim();
  return JSON.parse(cleaned);
}

const INDIAN_CONTEXT = `You are specialized in Indian cuisine and nutrition. Focus on:
- Traditional Indian dishes: biryani, curries, dal, roti, dosa, idli, samosa, chaat, paneer dishes, etc.
- Indian spices: turmeric, cumin, coriander, cardamom, garam masala, mustard seeds, fenugreek, etc.
- Indian dietary patterns: vegetarian, vegan Jain, and non-vegetarian Indian diets.
- Regional Indian cuisines: North Indian, South Indian, Bengali, Gujarati, Punjabi, Rajasthani, etc.
- Common Indian ingredients: ghee, paneer, dal (lentils), coconut, mustard oil, besan (gram flour), etc.`;

router.post("/ai/analyze-ingredients", async (req, res) => {
  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 required" });
      return;
    }
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            {
              text: `${INDIAN_CONTEXT}

Identify all visible food ingredients in this image, with a focus on Indian foods and ingredients if present. Return only valid JSON with no markdown:
{"ingredients":[{"name":"string","quantity":"string or null","confidence":0.95}]}`,
            },
          ],
        },
      ],
    });
    const content = response.text ?? '{"ingredients":[]}';
    try {
      res.json(parseJSON(content));
    } catch {
      res.json({ ingredients: [] });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "GEMINI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY in Secrets." });
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
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            {
              text: `${INDIAN_CONTEXT}

Analyze the food in this image and provide accurate nutrition information. For Indian foods, be precise about calorie counts (e.g., dal makhani ~200 kcal/100g, biryani ~175 kcal/100g, roti ~300 kcal each). Return only valid JSON with no markdown:
{"foodName":"string","calories":350,"protein":25,"carbs":40,"fats":12,"fiber":5,"sugar":8,"sodium":420,"nutritionScore":75,"healthRating":"good"}`,
            },
          ],
        },
      ],
    });
    const content = response.text ?? "{}";
    try {
      res.json(parseJSON(content));
    } catch {
      res.status(500).json({ error: "Could not parse nutrition data" });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "GEMINI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to analyze nutrition" });
  }
});

router.post("/ai/generate-recipes", async (req, res) => {
  try {
    const { ingredients, servings = 2, dietary = "" } = req.body as {
      ingredients: string[];
      servings?: number;
      dietary?: string;
    };
    if (!ingredients?.length) {
      res.status(400).json({ error: "ingredients required" });
      return;
    }
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${INDIAN_CONTEXT}

Create 3 authentic Indian recipes using these ingredients: ${ingredients.join(", ")}. Servings: ${servings}.${dietary ? ` Dietary restriction: ${dietary}.` : ""}

Prioritize traditional Indian dishes and cooking techniques (tadka, dum cooking, etc.). Include authentic spice combinations. If ingredients are non-Indian, suggest fusion or adapt to Indian style.

Return only valid JSON with no markdown:
{"recipes":[{"id":"r1","name":"string","description":"string","difficulty":"easy","prepTime":15,"cookTime":20,"calories":450,"servings":${servings},"ingredients":[{"name":"string","amount":"string"}],"instructions":["Step 1..."],"tips":["Tip 1"],"nutritionInfo":{"protein":30,"carbs":45,"fats":15,"fiber":6}}]}`,
            },
          ],
        },
      ],
    });
    const content = response.text ?? '{"recipes":[]}';
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
    if (err instanceof Error && err.message === "GEMINI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate recipes" });
  }
});

router.post("/ai/meal-plan", async (req, res) => {
  try {
    const { goal = "maintain", duration = "week", calories = 2000, dietary = "" } = req.body as {
      goal?: string;
      duration?: string;
      calories?: number;
      dietary?: string;
    };
    const days = duration === "day" ? 1 : duration === "week" ? 7 : 30;
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${INDIAN_CONTEXT}

Create a ${days}-day Indian meal plan. Goal: ${goal}. Target: ~${calories} cal/day.${dietary ? ` Dietary: ${dietary}.` : ""}

Use authentic Indian meals throughout: poha/upma/paratha for breakfast, dal-rice/roti-sabzi/biryani for lunch, curries/khichdi/dosa for dinner, and chaat/fruits/lassi for snacks. Vary regional cuisines across days.

Return only valid JSON with no markdown:
{"plan":[{"day":"Monday","meals":{"breakfast":{"name":"Poha with peanuts","calories":250},"lunch":{"name":"Dal makhani with rice","calories":520},"dinner":{"name":"Palak paneer with roti","calories":480},"snack":{"name":"Masala chai with biscuit","calories":120}}}]}`,
            },
          ],
        },
      ],
    });
    const content = response.text ?? '{"plan":[]}';
    try {
      res.json(parseJSON(content));
    } catch {
      res.json({ plan: [] });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "GEMINI_API_KEY not configured") {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY in Secrets." });
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
    const ai = getGemini();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = `You are Ingrivio's AI nutrition assistant, specialized in Indian cuisine and nutrition. You are knowledgeable about:
- Indian foods: dal, paneer, biryani, roti, dosa, idli, sabzi, curries, chaat, pickles, chutneys, etc.
- Indian spices and their health benefits: turmeric (anti-inflammatory), cumin (digestion), fenugreek (blood sugar), etc.
- Ayurvedic dietary principles and traditional Indian health wisdom.
- Calories and nutrition in Indian dishes (e.g., 1 roti = ~100 kcal, 1 cup dal = ~180 kcal).
- Regional Indian cuisines and their nutritional profiles.
- Indian dietary patterns: vegetarian, vegan, Jain, and non-vegetarian diets.
- Healthy Indian cooking techniques: reducing oil, using ghee in moderation, increasing fiber with dal and vegetables.

Be concise, friendly, and practical. Mix Hindi food terms naturally. Never give medical diagnoses. If asked in Hindi or Hinglish, respond in the same language.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...history.slice(-10).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "GEMINI_API_KEY not configured") {
      res.write(`data: ${JSON.stringify({ error: "AI not configured. Add GEMINI_API_KEY in Secrets." })}\n\n`);
      res.end();
      return;
    }
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
