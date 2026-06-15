// Curated real-world Unsplash food images for specific Indian dishes
// Each dish maps to a specific, authentic-looking food photo URL

const RECIPE_IMAGE_MAP: Record<string, string> = {
  // Biryani
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
  "hyderabadi biryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80",
  "chicken biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
  "mutton biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
  "vegetable biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
  "pulao": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "fried rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80",

  // Curries
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

  // Breads
  "naan": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
  "roti": "https://images.unsplash.com/photo-1574701148212-8518049c7b2c?w=600&q=80",
  "chapati": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80",
  "paratha": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
  "puri": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",

  // South Indian
  "dosa": "https://images.unsplash.com/photo-1589301760014-d11ec9c172f0?w=600&q=80",
  "idli": "https://images.unsplash.com/photo-1630409350695-a0e686b7b8a0?w=600&q=80",
  "sambar": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  "uttapam": "https://images.unsplash.com/photo-1589301760014-d11ec9c172f0?w=600&q=80",
  "vada": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "medu vada": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "pongal": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "upma": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "poha": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",

  // Snacks & Street Food
  "samosa": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
  "pakora": "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
  "bhajiya": "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
  "chaat": "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  "pani puri": "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  "bhel puri": "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  "kachori": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",

  // Desserts & Sweets
  "kheer": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  "gulab jamun": "https://images.unsplash.com/photo-1551404973-761c83cd8339?w=600&q=80",
  "halwa": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  "jalebi": "https://images.unsplash.com/photo-1551404973-761c83cd8339?w=600&q=80",
  "barfi": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  "ladoo": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  "ras malai": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",

  // Drinks & Beverages
  "chai": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "masala chai": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "lassi": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "nimbu pani": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",

  // Rice Dishes
  "khichdi": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
  "jeera rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80",
  "lemon rice": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  "curd rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",

  // Soups & Salads
  "rasam": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "shorba": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80",
  "kachumber": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "raita": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",

  // Sabzi / Vegetables
  "sabzi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "mixed sabzi": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80",
  "gobi sabzi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "gobi matar": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
  "gobi gajar zucchini ki sabzi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
};

// Default fallback images for unmatched dishes
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
];

/**
 * Get the best matching image URL for a recipe name.
 * Tries exact match first, then partial match.
 */
export function getRecipeImage(name: string): string {
  const lower = name.toLowerCase();

  // Exact match first
  if (RECIPE_IMAGE_MAP[lower]) {
    return RECIPE_IMAGE_MAP[lower];
  }

  // Partial match: find the best keyword match
  const keys = Object.keys(RECIPE_IMAGE_MAP);
  for (const key of keys) {
    if (lower.includes(key)) {
      return RECIPE_IMAGE_MAP[key];
    }
  }

  // Last resort: hash-based default
  const hash = lower.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length];
}

/**
 * Get multiple images for a recipe (for detail page carousel)
 */
export function getRecipeImages(name: string): string[] {
  const main = getRecipeImage(name);
  // Return main + 2 related defaults
  const hash = name.toLowerCase().split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return [
    main,
    DEFAULT_IMAGES[(hash + 1) % DEFAULT_IMAGES.length],
    DEFAULT_IMAGES[(hash + 2) % DEFAULT_IMAGES.length],
  ];
}
