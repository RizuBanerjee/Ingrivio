import { Router } from "express";
import { createAIOrchestrator, type AIMessage } from "../lib/ai-providers";

// Map common Indian dish names to real food images
const RECIPE_IMAGE_MAP: Record<string, string> = {
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
  "hyderabadi biryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80",
  "chicken biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
  "mutton biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
  "vegetable biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
  "pulao": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "fried rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80",
  "butter chicken": "https://images.unsplash.com/photo-1603360946369-d11ec9c172f0?w=600&q=80",
  "chicken tikka masala": "https://images.unsplash.com/photo-1603360946369-d11ec9c172f0?w=600&q=80",
  "dal makhani": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  "dal tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
  "chana masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
  "rajma": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
  "chole": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
  "chole bhature": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
  "palak paneer": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
  "shahi paneer": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
  "paneer tikka": "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=600&q=80",
  "paneer bhurji": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
  "matar paneer": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
  "aloo gobi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "aloo matar": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80",
  "bhindi masala": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80",
  "baingan bharta": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "mutton curry": "https://images.unsplash.com/photo-1603360946369-d11ec9c172f0?w=600&q=80",
  "keema": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
  "fish curry": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
  "prawn curry": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
  "egg curry": "https://images.unsplash.com/photo-1518185285670-efa3dab1e88b?w=600&q=80",
  "naan": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
  "roti": "https://images.unsplash.com/photo-1574701148212-8518049c7b2c?w=600&q=80",
  "chapati": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80",
  "paratha": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
  "puri": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
  "dosa": "https://images.unsplash.com/photo-1589301760014-d11ec9c172f0?w=600&q=80",
  "idli": "https://images.unsplash.com/photo-1630409350695-a0e686b7b8a0?w=600&q=80",
  "sambar": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  "uttapam": "https://images.unsplash.com/photo-1589301760014-d11ec9c172f0?w=600&q=80",
  "vada": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "medu vada": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "pongal": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "upma": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "poha": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "samosa": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "pakora": "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
  "bhajiya": "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
  "chaat": "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  "pani puri": "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  "bhel puri": "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  "kachori": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "kheer": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  "gulab jamun": "https://images.unsplash.com/photo-1551404973-761c83cd8339?w=600&q=80",
  "halwa": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  "jalebi": "https://images.unsplash.com/photo-1551404973-761c83cd8339?w=600&q=80",
  "barfi": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  "ladoo": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  "ras malai": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  "chai": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "masala chai": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "lassi": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "nimbu pani": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "khichdi": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "jeera rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80",
  "lemon rice": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "curd rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "rasam": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "shorba": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80",
  "kachumber": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "raita": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
  "sabzi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "mixed sabzi": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80",
  "gobi sabzi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "gobi matar": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "gobi gajar zucchini ki sabzi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "vegetable curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
  "chicken": "https://images.unsplash.com/photo-1603360946369-d11ec9c172f0?w=600&q=80",
  "rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "egg": "https://images.unsplash.com/photo-1518185285670-efa3dab1e88b?w=600&q=80",
  "fish": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
  "dessert": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  "default": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
];

function getRecipeImage(name: string): string {
  const lower = name.toLowerCase();
  if (RECIPE_IMAGE_MAP[lower]) return RECIPE_IMAGE_MAP[lower];
  for (const key of Object.keys(RECIPE_IMAGE_MAP)) {
    if (lower.includes(key)) return RECIPE_IMAGE_MAP[key];
  }
  const hash = lower.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length];
}

function parseJSON(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gm, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

const INDIAN_CONTEXT = `You are specialized in Indian cuisine and nutrition. Focus on:
- Traditional Indian dishes: biryani, curries, dal, roti, dosa, idli, samosa, chaat, paneer dishes, etc.
- Indian spices: turmeric, cumin, coriander, cardamom, garam masala, mustard seeds, fenugreek, etc.
- Indian dietary patterns: vegetarian, vegan Jain, and non-vegetarian Indian diets.
- Regional Indian cuisines: North Indian, South Indian, Bengali, Gujarati, Punjabi, Rajasthani, etc.
- Common Indian ingredients: ghee, paneer, dal (lentils), coconut, mustard oil, besan (gram flour), etc.`;

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
//  Initialize AI orchestrator
// ─────────────────────────────────────────────────────────────────────────────

let aiOrchestrator: ReturnType<typeof createAIOrchestrator> | null = null;

function getAI() {
  if (!aiOrchestrator) {
    aiOrchestrator = createAIOrchestrator();
  }
  return aiOrchestrator;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Analyze Ingredients
// ─────────────────────────────────────────────────────────────────────────────

router.post("/ai/analyze-ingredients", async (req, res): Promise<void> => {
  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 required" });
      return;
    }

    const ai = getAI();
    const messages: AIMessage[] = [
      {
        role: "user",
        content: `${INDIAN_CONTEXT}

Identify all visible food ingredients in this image, with a focus on Indian foods and ingredients if present. Return only valid JSON with no markdown:
{"ingredients":[{"name":"string","quantity":"string or null","confidence":0.95}]}`,
        imageData: { base64: imageBase64, mimeType: "image/jpeg" },
      },
    ];

    const response = await ai.generateContent(messages);
    try {
      res.json({ ...parseJSON(response.text), _provider: response.provider });
    } catch {
      res.json({ ingredients: [], _provider: response.provider });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("not configured")) {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to analyze ingredients", _provider: "none" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Analyze Nutrition
// ─────────────────────────────────────────────────────────────────────────────

router.post("/ai/analyze-nutrition", async (req, res): Promise<void> => {
  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 required" });
      return;
    }

    const ai = getAI();
    const messages: AIMessage[] = [
      {
        role: "user",
        content: `${INDIAN_CONTEXT}

Analyze the food in this image and provide accurate nutrition information. For Indian foods, be precise about calorie counts (e.g., dal makhani ~200 kcal/100g, biryani ~175 kcal/100g, roti ~300 kcal each). Return only valid JSON with no markdown:
{"foodName":"string","calories":350,"protein":25,"carbs":40,"fats":12,"fiber":5,"sugar":8,"sodium":420,"nutritionScore":75,"healthRating":"good"}`,
        imageData: { base64: imageBase64, mimeType: "image/jpeg" },
      },
    ];

    const response = await ai.generateContent(messages);
    try {
      res.json({ ...parseJSON(response.text), _provider: response.provider });
    } catch {
      res.status(500).json({ error: "Could not parse nutrition data", _provider: response.provider });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("not configured")) {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to analyze nutrition", _provider: "none" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Generate Recipes
// ─────────────────────────────────────────────────────────────────────────────

router.post("/ai/generate-recipes", async (req, res): Promise<void> => {
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

    const ai = getAI();
    const messages: AIMessage[] = [
      {
        role: "user",
        content: `${INDIAN_CONTEXT}

Create 3 authentic Indian recipes using these ingredients: ${ingredients.join(", ")}. Servings: ${servings}.${dietary ? ` Dietary restriction: ${dietary}.` : ""}

Prioritize traditional Indian dishes and cooking techniques (tadka, dum cooking, etc.). Include authentic spice combinations. If ingredients are non-Indian, suggest fusion or adapt to Indian style.

Return only valid JSON with no markdown:
{"recipes":[{"id":"r1","name":"string","description":"string","difficulty":"easy","prepTime":15,"cookTime":20,"calories":450,"servings":${servings},"ingredients":[{"name":"string","amount":"string"}],"instructions":["Step 1..."],"tips":["Tip 1"],"nutritionInfo":{"protein":30,"carbs":45,"fats":15,"fiber":6}}]}`,
      },
    ];

    const response = await ai.generateContent(messages);
    try {
      const parsed = parseJSON(response.text) as { recipes: Record<string, unknown>[] };
      if (Array.isArray(parsed.recipes)) {
        parsed.recipes = parsed.recipes.map((r, i) => {
          const name = (r.name as string) || "Unknown";
          return {
            ...r,
            id: `recipe-${Date.now()}-${i}`,
            imageUrl: getRecipeImage(name),
          };
        });
      }
      res.json({ ...parsed, _provider: response.provider });
    } catch {
      res.json({ recipes: [], _provider: response.provider });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("not configured")) {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate recipes", _provider: "none" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Meal Plan
// ─────────────────────────────────────────────────────────────────────────────

router.post("/ai/meal-plan", async (req, res): Promise<void> => {
  try {
    const { goal = "maintain", duration = "week", calories = 2000, dietary = "" } = req.body as {
      goal?: string;
      duration?: string;
      calories?: number;
      dietary?: string;
    };
    const days = duration === "day" ? 1 : duration === "week" ? 7 : 30;

    const ai = getAI();
    const messages: AIMessage[] = [
      {
        role: "user",
        content: `${INDIAN_CONTEXT}

Create a ${days}-day Indian meal plan. Goal: ${goal}. Target: ~${calories} cal/day.${dietary ? ` Dietary: ${dietary}.` : ""}

Use authentic Indian meals throughout: poha/upma/paratha for breakfast, dal-rice/roti-sabzi/biryani for lunch, curries/khichdi/dosa for dinner, and chaat/fruits/lassi for snacks. Vary regional cuisines across days.

Return only valid JSON with no markdown:
{"plan":[{"day":"Monday","meals":{"breakfast":{"name":"Poha with peanuts","calories":250},"lunch":{"name":"Dal makhani with rice","calories":520},"dinner":{"name":"Palak paneer with roti","calories":480},"snack":{"name":"Masala chai with biscuit","calories":120}}}]}`,
      },
    ];

    const response = await ai.generateContent(messages);
    try {
      res.json({ ...parseJSON(response.text), _provider: response.provider });
    } catch {
      res.json({ plan: [], _provider: response.provider });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("not configured")) {
      res.status(503).json({ error: "AI not configured. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in Secrets." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate meal plan", _provider: "none" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Chat (Streaming)
// ─────────────────────────────────────────────────────────────────────────────

router.post("/ai/chat", async (req, res): Promise<void> => {
  try {
    const { message, history = [] } = req.body as {
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
    };
    if (!message) {
      res.status(400).json({ error: "message required" });
      return;
    }

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

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const ai = getAI();
    let providerUsed = "none";

    for await (const chunk of ai.generateContentStream(messages)) {
      if (chunk.error) {
        res.write(`data: ${JSON.stringify({ error: chunk.error })}
\n`);
        res.end();
        return;
      }
      if (chunk.done) {
        res.write(`data: ${JSON.stringify({ done: true })}
\n`);
        res.end();
        return;
      }
      if (chunk.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.content })}
\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}
\n`);
    res.end();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("not configured")) {
      res.write(`data: ${JSON.stringify({ error: "AI not configured. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in Secrets." })}
\n`);
      res.end();
      return;
    }
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response. Please try again." })}
\n`);
    res.end();
  }
});

export default router;
