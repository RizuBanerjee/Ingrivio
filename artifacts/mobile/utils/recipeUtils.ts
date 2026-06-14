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
  if (l.includes("fish") || l.includes("prawn") || l.includes("shrimp") || l.includes("jhinga") || l.includes("macher")) return "🐟";
  if (l.includes("samosa")) return "🥟";
  if (l.includes("pakora") || l.includes("bhajiya") || l.includes("fritter")) return "🧆";
  if (l.includes("chaat") || l.includes("pani puri") || l.includes("bhel") || l.includes("aloo tikki")) return "🥘";
  if (l.includes("dosa") || l.includes("idli") || l.includes("vada") || l.includes("uttapam")) return "🥞";
  if (l.includes("raita") || l.includes("kachumber")) return "🥗";
  if (l.includes("soup") || l.includes("rasam") || l.includes("shorba")) return "🍲";
  if (l.includes("kheer") || l.includes("halwa") || l.includes("gulab") || l.includes("ladoo") || l.includes("barfi") || l.includes("jalebi") || l.includes("payasam")) return "🍮";
  if (l.includes("chai") || l.includes("lassi") || l.includes("sharbat") || l.includes("nimbu")) return "☕";
  if (l.includes("rice") || l.includes("pulao") || l.includes("khichdi") || l.includes("fried rice")) return "🍚";
  if (l.includes("sandwich") || l.includes("toast") || l.includes("bread")) return "🥪";
  if (l.includes("egg") || l.includes("anda")) return "🥚";
  if (l.includes("salad")) return "🥗";
  if (l.includes("sabzi") || l.includes("vegetable") || l.includes("subji")) return "🥦";
  if (l.includes("thali")) return "🍱";
  if (l.includes("kebab") || l.includes("tikka") || l.includes("tandoori")) return "🍢";
  return "🍽️";
}
