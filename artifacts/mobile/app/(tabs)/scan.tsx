import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { analyzeIngredients, analyzeNutrition, generateRecipes } from "@/services/ai";
import { logFoodScanned, logRecipeGenerated } from "@/firebase/analyticsClient";
import type { Ingredient, NutritionResult } from "@/services/ai";

type Mode = "ingredients" | "nutrition";

const RATING_COLOR: Record<string, string> = {
  excellent: "#40C057",
  good: "#52B788",
  moderate: "#FFBA08",
  poor: "#FF6B35",
};

export default function ScanScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { scannedIngredients, setScannedIngredients, setGeneratedRecipes, setLastNutrition, addFoodEntry } = useApp();

  const [mode, setMode] = useState<Mode>("ingredients");
  const [loading, setLoading] = useState(false);
  // Store BOTH results independently — switching mode never clears them
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [nutrition, setNutrition] = useState<NutritionResult | null>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [lastBase64, setLastBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Track which modes have been analyzed for current image
  const [analyzedModes, setAnalyzedModes] = useState<Set<Mode>>(new Set());
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [mealPickerFor, setMealPickerFor] = useState<"nutrition" | "recipe" | null>(null);

  const pickImage = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission needed", "Camera access is required to scan food.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission needed", "Photo library access is required.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
          mediaTypes: ["images"],
        });
      }

      if (result.canceled || !result.assets[0]?.base64) return;

      const base64 = result.assets[0].base64;
      const uri = result.assets[0].uri;

      // New image: clear ALL previous results
      setScannedImageUri(uri);
      setLastBase64(base64);
      setIngredients([]);
      setNutrition(null);
      setAnalyzedModes(new Set());
      setError(null);
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Analyze current mode only
      await analyzeMode(mode, base64, new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!ingredients.length) return;
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const names = ingredients.map((i) => i.name);
      const recipes = await generateRecipes(names);
      logRecipeGenerated(recipes[0]?.name || "unknown");
      setGeneratedRecipes(recipes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to recipes tab
      router.navigate("/recipes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate recipes. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMode = async (targetMode: Mode, base64: string, alreadyDone: Set<Mode>) => {
    if (alreadyDone.has(targetMode)) return;
    setLoading(true);
    setError(null);
    try {
      if (targetMode === "ingredients") {
        const items = await analyzeIngredients(base64);
        logFoodScanned("ingredients");
        setIngredients(items);
        setScannedIngredients(items);
        setGeneratedRecipes([]);
      } else {
        // Nutrition analysis: use ingredients if available, else fall back to image
        const res = ingredients.length > 0
          ? await analyzeNutrition(ingredients.map((i: Ingredient) => i.name))
          : await analyzeNutrition(base64);
        logFoodScanned("nutrition");
        setNutrition(res);
        setLastNutrition(res);
      }
      setAnalyzedModes((prev) => new Set([...prev, targetMode]));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // Switch mode — if we have image but haven't analyzed this mode yet, auto-analyze it now
  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    // Don't clear ingredients or nutrition — they persist across mode switches
    // Auto-analyze the other mode if we have the base64
    if (lastBase64 && !analyzedModes.has(m)) {
      analyzeMode(m, lastBase64, analyzedModes);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 4 },
    modeRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius - 4,
      padding: 4,
      marginBottom: 20,
      marginTop: 16,
    },
    modeBtn: {
      flex: 1, paddingVertical: 10, alignItems: "center",
      borderRadius: colors.radius - 8,
    },
    modeBtnActive: {
      backgroundColor: colors.card,
      shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    modeBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    modeBtnTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    pickRow: { flexDirection: "row", marginHorizontal: 20, gap: 12, marginBottom: 20 },
    pickBtn: {
      flex: 1, backgroundColor: colors.card, borderRadius: colors.radius,
      paddingVertical: 18, alignItems: "center", gap: 8,
      borderWidth: 1, borderColor: colors.border,
    },
    pickBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    scannedImageWrap: {
      marginHorizontal: 20, marginBottom: 16, borderRadius: colors.radius,
      overflow: "hidden", height: 160, borderWidth: 1, borderColor: colors.border,
    },
    scannedImage: { width: "100%", height: "100%" },
    scannedOverlay: {
      position: "absolute", bottom: 8, right: 8,
      backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 5,
      flexDirection: "row", alignItems: "center", gap: 5,
    },
    scannedOverlayText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#FFFFFF" },
    loadingBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
    loadingText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    errorBox: {
      marginHorizontal: 20, backgroundColor: colors.destructive + "15",
      borderRadius: colors.radius, padding: 16,
      flexDirection: "row", gap: 10, alignItems: "flex-start",
    },
    errorText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.destructive },
    sectionTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginHorizontal: 20, marginBottom: 12,
    },
    ingredientChip: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
      borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
      marginBottom: 8, marginHorizontal: 20, borderWidth: 1, borderColor: colors.border, gap: 10,
    },
    chipName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground },
    chipQty: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    confDot: { width: 8, height: 8, borderRadius: 4 },
    genBtn: {
      marginHorizontal: 20, marginTop: 16, borderRadius: colors.radius,
      paddingVertical: 16, flexDirection: "row", alignItems: "center",
      justifyContent: "center", gap: 8, overflow: "hidden",
    },
    genBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    nutCard: {
      marginHorizontal: 20, backgroundColor: colors.card,
      borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: "hidden",
    },
    nutHeader: { padding: 20 },
    nutFood: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    nutCal: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 4 },
    nutBody: { padding: 16 },
    nutRow: {
      flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    nutLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    nutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    ratingBadge: {
      alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5,
      borderRadius: 8, marginTop: 12,
    },
    ratingText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    notYetBox: {
      marginHorizontal: 20, backgroundColor: colors.secondary,
      borderRadius: colors.radius, padding: 20,
      alignItems: "center", gap: 10,
    },
    notYetText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
    spacer: { height: Platform.OS === "web" ? 100 : insets.bottom + 120 },
    empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 30 },
  });

  const confColor = (c: number) => {
    if (c > 0.8) return colors.success;
    if (c > 0.5) return colors.fats;
    return colors.destructive;
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={theme.gradients.header as [string, string, ...string[]]}
          style={s.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={s.title}>{t("ai_scanner")}</Text>
          <Text style={s.subtitle}>Identify ingredients or analyze nutrition</Text>
        </LinearGradient>

        <View style={s.modeRow}>
          {(["ingredients", "nutrition"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[s.modeBtn, mode === m && s.modeBtnActive]}
              onPress={() => switchMode(m)}
            >
              <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                {m === "ingredients" ? t("ingredients") : t("nutrition")}
                {analyzedModes.has(m) ? " ✓" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.pickRow}>
          <TouchableOpacity
            style={[s.pickBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => pickImage(true)}
            disabled={loading}
          >
            <Feather name="camera" size={24} color={colors.primaryForeground} />
            <Text style={[s.pickBtnText, { color: colors.primaryForeground }]}>{t("camera")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.pickBtn} onPress={() => pickImage(false)} disabled={loading}>
            <Feather name="image" size={24} color={colors.primary} />
            <Text style={[s.pickBtnText, { color: colors.primary }]}>{t("gallery")}</Text>
          </TouchableOpacity>
        </View>

        {scannedImageUri && (
          <View style={s.scannedImageWrap}>
            <Image source={{ uri: scannedImageUri }} style={s.scannedImage} resizeMode="cover" />
            <View style={s.scannedOverlay}>
              <Feather name="check-circle" size={13} color="#FFFFFF" />
              <Text style={s.scannedOverlayText}>Image scanned</Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loadingText}>
              {mode === "ingredients" ? t("detecting") : t("analyzing")}
            </Text>
          </View>
        )}

        {error && !loading && (
          <View style={s.errorBox}>
            <Feather name="alert-circle" size={18} color={colors.destructive} />
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                if (lastBase64) {
                  analyzeMode(mode, lastBase64, analyzedModes);
                } else if (mode === "ingredients" && ingredients.length > 0) {
                  handleGenerate();
                }
              }}
              style={{ padding: 6, backgroundColor: colors.destructive + "20", borderRadius: 8 }}
            >
              <Feather name="refresh-cw" size={16} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}

        {/* Ingredients results */}
        {!loading && mode === "ingredients" && (
          ingredients.length > 0 ? (
            <>
              <Text style={s.sectionTitle}>{t("detected")} ({ingredients.length} {t("ingredients_detected")})</Text>
              {ingredients.map((ing, idx) => (
                <View key={idx} style={s.ingredientChip}>
                  <View style={[s.confDot, { backgroundColor: confColor(ing.confidence) }]} />
                  <Text style={s.chipName}>{ing.name}</Text>
                  {ing.quantity && <Text style={s.chipQty}>{ing.quantity}</Text>}
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                    {Math.round(ing.confidence * 100)}%
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={s.genBtn}
                onPress={handleGenerate}
                disabled={loading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="book-open" size={18} color={colors.primaryForeground} />
                  <Text style={s.genBtnText}>{t("generate_recipes")}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.genBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]} 
                onPress={handleGenerate}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="refresh-cw" size={18} color={colors.primary} />
                  <Text style={[s.genBtnText, { color: colors.primary }]}>Regenerate Recipes</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : scannedImageUri && !error && !loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>Detecting ingredients...</Text>
            </View>
          ) : (
            <View style={s.empty}>
              <Feather name="aperture" size={40} color={colors.border} />
              <Text style={s.emptyText}>Take a photo or choose from gallery{"\n"}to identify ingredients</Text>
            </View>
          )
        )}

        {/* Nutrition results */}
        {!loading && mode === "nutrition" && (
          nutrition ? (
            <View>
              <View style={s.nutCard}>
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={s.nutHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={s.nutFood}>{nutrition.foodName}</Text>
                  <Text style={s.nutCal}>{nutrition.calories} kcal per serving</Text>
                </LinearGradient>
                <View style={s.nutBody}>
                  {([
                    ["Protein", `${nutrition.protein}g`],
                    ["Carbohydrates", `${nutrition.carbs}g`],
                    ["Fats", `${nutrition.fats}g`],
                    ["Fiber", `${nutrition.fiber}g`],
                    ["Sugar", `${nutrition.sugar}g`],
                    ["Sodium", `${nutrition.sodium}mg`],
                  ] as [string, string][]).map(([label, value], i, arr) => (
                    <View key={label} style={[s.nutRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={s.nutLabel}>{label}</Text>
                      <Text style={s.nutValue}>{value}</Text>
                    </View>
                  ))}
                  <View style={[s.ratingBadge, { backgroundColor: (RATING_COLOR[nutrition.healthRating] ?? colors.accent) + "20" }]}>
                    <Text style={[s.ratingText, { color: RATING_COLOR[nutrition.healthRating] ?? colors.accent }]}>
                      {nutrition.healthRating} — score {nutrition.nutritionScore}/100
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={s.genBtn}
                onPress={() => { setMealPickerFor("nutrition"); setShowMealPicker(true); }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="plus-circle" size={18} color={colors.primaryForeground} />
                  <Text style={s.genBtnText}>Log This Meal</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : scannedImageUri && !error && !loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>Analyzing nutrition...</Text>
            </View>
          ) : (
            <View style={s.empty}>
              <Feather name="pie-chart" size={40} color={colors.border} />
              <Text style={s.emptyText}>Take a photo or choose from gallery{"\n"}to analyze nutrition</Text>
            </View>
          )
        )}

        {/* Meal Type Picker Modal */}
        {showMealPicker && (
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}>
            <View style={{
              backgroundColor: colors.card, borderRadius: colors.radius, marginHorizontal: 30,
              padding: 20, width: "80%", borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{
                fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 16, textAlign: "center",
              }}>Log as which meal?</Text>
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((mealType) => (
                <TouchableOpacity
                  key={mealType}
                  style={{
                    paddingVertical: 14, paddingHorizontal: 16, borderRadius: colors.radius - 6,
                    backgroundColor: colors.secondary, marginBottom: 10, alignItems: "center",
                  }}
                  onPress={() => {
                    setShowMealPicker(false);
                    const entry = nutrition
                      ? { name: nutrition.foodName, calories: nutrition.calories, protein: nutrition.protein, carbs: nutrition.carbs, fats: nutrition.fats, meal: mealType }
                      : { name: "Scanned ingredients", calories: 0, protein: 0, carbs: 0, fats: 0, meal: mealType };
                    addFoodEntry(entry);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                >
                  <Text style={{
                    fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primary, textTransform: "capitalize",
                  }}>{mealType}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: "center" }}
                onPress={() => setShowMealPicker(false)}
              >
                <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
