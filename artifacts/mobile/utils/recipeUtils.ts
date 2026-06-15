// Curated Unsplash food images (stable, no API key needed)
const RECIPE_IMAGES: Record<string, string[]> = {
  biryani: [
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80",
    "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
  ],
  curry: [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
    "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80",
  ],
  dal: [
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  ],
  paneer: [
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
    "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=600&q=80",
  ],
  chicken: [
    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80",
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
  ],
  rice: [
    "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
    "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  ],
  roti: [
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    "https://images.unsplash.com/photo-1574701148212-8518049c7b2c?w=600&q=80",
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80",
  ],
  samosa: [
    "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80",
    "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
    "https://images.unsplash.com/photo-1614777986387-015c2a89c853?w=600&q=80",
  ],
  dosa: [
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
    "https://images.unsplash.com/photo-1630409350695-a0e686b7b8a0?w=600&q=80",
    "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  ],
  salad: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  ],
  soup: [
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
    "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80",
    "https://images.unsplash.com/photo-1585325701165-e5fcf5c70f9a?w=600&q=80",
  ],
  egg: [
    "https://images.unsplash.com/photo-1518185285670-efa3dab1e88b?w=600&q=80",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80",
    "https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=600&q=80",
  ],
  fish: [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
    "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80",
  ],
  dessert: [
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
    "https://images.unsplash.com/photo-1551404973-761c83cd8339?w=600&q=80",
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  ],
};

function getCategoryKey(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("biryani") || l.includes("pulao")) return "biryani";
  if (l.includes("curry") || l.includes("masala") || l.includes("korma") || l.includes("makhani") || l.includes("tikka") || l.includes("kebab") || l.includes("tandoori")) return "curry";
  if (l.includes("dal") || l.includes("daal") || l.includes("lentil") || l.includes("rajma") || l.includes("chana")) return "dal";
  if (l.includes("paneer") || l.includes("palak paneer") || l.includes("shahi paneer")) return "paneer";
  if (l.includes("chicken") || l.includes("murgh") || l.includes("mutton") || l.includes("lamb") || l.includes("keema")) return "chicken";
  if (l.includes("roti") || l.includes("chapati") || l.includes("paratha") || l.includes("naan") || l.includes("puri") || l.includes("bread")) return "roti";
  if (l.includes("samosa") || l.includes("pakora") || l.includes("bhaji") || l.includes("bhajiya") || l.includes("vada")) return "samosa";
  if (l.includes("dosa") || l.includes("idli") || l.includes("uttapam")) return "dosa";
  if (l.includes("fish") || l.includes("prawn") || l.includes("shrimp") || l.includes("seafood") || l.includes("jhinga") || l.includes("macher")) return "fish";
  if (l.includes("salad") || l.includes("kachumber") || l.includes("raita")) return "salad";
  if (l.includes("soup") || l.includes("rasam") || l.includes("shorba")) return "soup";
  if (l.includes("egg") || l.includes("anda") || l.includes("omelette")) return "egg";
  if (l.includes("kheer") || l.includes("halwa") || l.includes("gulab") || l.includes("ladoo") || l.includes("barfi") || l.includes("jalebi") || l.includes("dessert") || l.includes("sweet")) return "dessert";
  if (l.includes("rice") || l.includes("khichdi") || l.includes("fried rice")) return "rice";
  return "default";
}

/**
 * Returns an array of 3 Unsplash photo URLs for a recipe name.
 */
export function getRecipeImages(name: string): string[] {
  const key = getCategoryKey(name);
  return RECIPE_IMAGES[key] ?? RECIPE_IMAGES.default;
}

/**
 * Returns a single image URL (by variant index) for a recipe name.
 */
export function getRecipeImage(name: string, variant = 0): string {
  const images = getRecipeImages(name);
  return images[variant % images.length];
}

const FOOD_GRADIENTS: [string, string][] = [
  ["#FF6B6B", "#FF8E53"],
  ["#A29BFE", "#6C5CE7"],
  ["#FD79A8", "#E84393"],
  ["#00B894", "#00CEC9"],
  ["#FDCB6E", "#E17055"],
  ["#74B9FF", "#0984E3"],
  ["#E17055", "#D63031"],
  ["#FDA7DF", "#D980FA"],
  ["#F9CA24", "#F0932B"],
  ["#4ECDC4", "#44A08D"],
  ["#6C5CE7", "#A29BFE"],
  ["#FF9FF3", "#F368E0"],
];

export function getRecipeGradient(name: string, variant = 0): [string, string] {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FOOD_GRADIENTS[(hash + variant * 4) % FOOD_GRADIENTS.length];
}

export function getRecipeEmoji(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("biryani")) return "🍚";
  if (l.includes("curry") || l.includes("masala") || l.includes("korma")) return "🍛";
  if (l.includes("dal") || l.includes("daal") || l.includes("lentil")) return "🫘";
  if (l.includes("roti") || l.includes("chapati") || l.includes("paratha") || l.includes("naan") || l.includes("puri")) return "🫓";
  if (l.includes("paneer")) return "🧀";
  if (l.includes("chicken") || l.includes("murgh")) return "🍗";
  if (l.includes("mutton") || l.includes("lamb") || l.includes("goat") || l.includes("keema")) return "🥩";
  if (l.includes("fish") || l.includes("prawn") || l.includes("shrimp") || l.includes("jhinga")) return "🐟";
  if (l.includes("samosa")) return "🥟";
  if (l.includes("pakora") || l.includes("bhajiya") || l.includes("fritter")) return "🧆";
  if (l.includes("chaat") || l.includes("pani puri") || l.includes("bhel")) return "🥘";
  if (l.includes("dosa") || l.includes("idli") || l.includes("vada") || l.includes("uttapam")) return "🥞";
  if (l.includes("raita") || l.includes("kachumber")) return "🥗";
  if (l.includes("soup") || l.includes("rasam") || l.includes("shorba")) return "🍲";
  if (l.includes("kheer") || l.includes("halwa") || l.includes("gulab") || l.includes("ladoo") || l.includes("barfi") || l.includes("jalebi")) return "🍮";
  if (l.includes("chai") || l.includes("lassi") || l.includes("nimbu")) return "☕";
  if (l.includes("rice") || l.includes("pulao") || l.includes("khichdi")) return "🍚";
  if (l.includes("egg") || l.includes("anda")) return "🥚";
  if (l.includes("salad")) return "🥗";
  if (l.includes("sabzi") || l.includes("vegetable") || l.includes("subji")) return "🥦";
  if (l.includes("kebab") || l.includes("tikka") || l.includes("tandoori")) return "🍢";
  return "🍽️";
}
