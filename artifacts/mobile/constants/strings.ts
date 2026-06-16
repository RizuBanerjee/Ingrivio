export type Language = "en" | "hi";

export type StringKey =
  | "home" | "scan" | "recipes" | "chat" | "profile"
  | "good_morning" | "good_afternoon" | "good_evening"
  | "kcal_eaten" | "remaining" | "macros" | "protein" | "carbs" | "fats"
  | "quick_actions" | "scan_food" | "ask_ai" | "todays_log"
  | "water" | "glasses_today" | "breakfast" | "lunch" | "dinner" | "snack"
  | "generated" | "saved" | "generate" | "search_recipes"
  | "ai_scanner" | "ingredients" | "nutrition" | "camera" | "gallery"
  | "settings" | "appearance" | "theme" | "language"
  | "body_stats" | "goal" | "gender" | "dietary_prefs" | "daily_targets"
  | "edit" | "save" | "save_changes"
  | "detecting" | "analyzing" | "detected"
  | "generate_recipes" | "generating_recipes"
  | "age" | "height" | "weight" | "today" | "bmi"
  | "ask_me_anything" | "send" | "log_this_meal"
  | "ingredients_detected" | "generate_from_scan"
  | "no_recipes_yet" | "no_saved_recipes"
  | "instructions" | "tips" | "nutrition_per_serving"
  | "lose_weight" | "maintain" | "gain_weight" | "build_muscle"
  | "sign_in" | "sign_out" | "sign_up" | "welcome" | "guest" | "sync";

const en: Record<StringKey, string> = {
  home: "Home", scan: "Scan", recipes: "Recipes", chat: "Chat", profile: "Profile",
  good_morning: "Good morning", good_afternoon: "Good afternoon", good_evening: "Good evening",
  kcal_eaten: "kcal eaten", remaining: "remaining",
  macros: "Macros", protein: "Protein", carbs: "Carbs", fats: "Fats",
  quick_actions: "Quick Actions", scan_food: "Scan Food", ask_ai: "Ask AI", todays_log: "Today's Log",
  water: "Water", glasses_today: "glasses today",
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
  generated: "Generated", saved: "Saved", generate: "Generate", search_recipes: "Search recipes...",
  ai_scanner: "Scan Your Food", ingredients: "Ingredients", nutrition: "Nutrition",
  camera: "Camera", gallery: "Gallery",
  settings: "Settings", appearance: "Appearance", theme: "Theme", language: "Language",
  body_stats: "Body Stats", goal: "Goal", gender: "Gender", dietary_prefs: "Dietary Preferences", daily_targets: "Daily Targets",
  edit: "Edit", save: "Save", save_changes: "Save Changes",
  detecting: "Detecting ingredients...", analyzing: "Analyzing nutrition...", detected: "Detected",
  generate_recipes: "Generate Recipes", generating_recipes: "Generating recipes...",
  age: "Age", height: "Height", weight: "Weight", today: "Today", bmi: "BMI",
  ask_me_anything: "Ask me anything", send: "Send", log_this_meal: "Log This Meal",
  ingredients_detected: "ingredients detected", generate_from_scan: "Generate recipes from your scan",
  no_recipes_yet: "No recipes yet", no_saved_recipes: "No saved recipes",
  instructions: "Instructions", tips: "Tips", nutrition_per_serving: "Nutrition per serving",
  lose_weight: "Lose Weight", maintain: "Maintain", gain_weight: "Gain Weight", build_muscle: "Build Muscle",
  sign_in: "Sign In", sign_out: "Sign Out", sign_up: "Sign Up", welcome: "Welcome", guest: "Guest", sync: "Sync",
};

const hi: Record<StringKey, string> = {
  home: "होम", scan: "स्कैन", recipes: "व्यंजन", chat: "चैट", profile: "प्रोफाइल",
  good_morning: "सुप्रभात", good_afternoon: "नमस्कार", good_evening: "शुभ संध्या",
  kcal_eaten: "कैलोरी खाई", remaining: "बाकी",
  macros: "मैक्रोज़", protein: "प्रोटीन", carbs: "कार्ब्स", fats: "वसा",
  quick_actions: "त्वरित क्रियाएं", scan_food: "खाना स्कैन करें", ask_ai: "AI से पूछें", todays_log: "आज का लॉग",
  water: "पानी", glasses_today: "गिलास आज",
  breakfast: "नाश्ता", lunch: "दोपहर का खाना", dinner: "रात का खाना", snack: "स्नैक",
  generated: "बनाए गए", saved: "सहेजे गए", generate: "बनाएं", search_recipes: "व्यंजन खोजें...",
  ai_scanner: "AI स्कैनर", ingredients: "सामग्री", nutrition: "पोषण",
  camera: "कैमरा", gallery: "गैलरी",
  settings: "सेटिंग्स", appearance: "रूप-रंग", theme: "थीम", language: "भाषा",
  body_stats: "शरीर के आंकड़े", goal: "लक्ष्य", gender: "लिंग", dietary_prefs: "आहार संबंधी प्राथमिकताएं", daily_targets: "दैनिक लक्ष्य",
  edit: "संपादित करें", save: "सहेजें", save_changes: "बदलाव सहेजें",
  detecting: "सामग्री खोजी जा रही है...", analyzing: "पोषण विश्लेषण हो रहा है...", detected: "मिली",
  generate_recipes: "व्यंजन बनाएं", generating_recipes: "व्यंजन बन रहे हैं...",
  age: "उम्र", height: "ऊंचाई", weight: "वजन", today: "आज", bmi: "BMI",
  ask_me_anything: "कुछ भी पूछें", send: "भेजें", log_this_meal: "यह भोजन लॉग करें",
  ingredients_detected: "सामग्री मिली", generate_from_scan: "स्कैन से व्यंजन बनाएं",
  no_recipes_yet: "अभी तक कोई व्यंजन नहीं", no_saved_recipes: "कोई सहेजा व्यंजन नहीं",
  instructions: "निर्देश", tips: "सुझाव", nutrition_per_serving: "प्रति सर्विंग पोषण",
  lose_weight: "वजन घटाएं", maintain: "बनाए रखें", gain_weight: "वजन बढ़ाएं", build_muscle: "मांसपेशी बनाएं",
  sign_in: "साइन इन", sign_out: "साइन आउट", sign_up: "साइन अप", welcome: "स्वागत", guest: "मेहमान", sync: "सिंक",
};

export const STRINGS: Record<Language, Record<StringKey, string>> = { en, hi };
