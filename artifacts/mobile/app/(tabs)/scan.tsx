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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { analyzeIngredients, analyzeNutrition } from "@/services/ai";
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
  const insets = useSafeAreaInsets();
  const { setScannedIngredients, setGeneratedRecipes, setLastNutrition } = useApp();

  const [mode, setMode] = useState<Mode>("ingredients");
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [nutrition, setNutrition] = useState<NutritionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);
      setIngredients([]);
      setNutrition(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (mode === "ingredients") {
        const items = await analyzeIngredients(base64);
        setIngredients(items);
        setScannedIngredients(items);
        setGeneratedRecipes([]);
      } else {
        const result2 = await analyzeNutrition(base64);
        setNutrition(result2);
        setLastNutrition(result2);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
    },
    modeRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius - 4,
      padding: 4,
      marginBottom: 24,
    },
    modeBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: colors.radius - 8,
    },
    modeBtnActive: { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    modeBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    modeBtnTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    pickRow: { flexDirection: "row", marginHorizontal: 20, gap: 12, marginBottom: 24 },
    pickBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingVertical: 20,
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickBtnPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pickBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    pickBtnTextPrimary: { color: colors.primaryForeground },
    loadingBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
    loadingText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    errorBox: {
      marginHorizontal: 20,
      backgroundColor: colors.destructive + "15",
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    errorText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.destructive },
    sectionTitle: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    ingredientChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 8,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    chipName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground },
    chipQty: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    confDot: { width: 8, height: 8, borderRadius: 4 },
    genBtn: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    genBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    nutCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    nutHeader: { backgroundColor: colors.primary, padding: 20 },
    nutFood: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.primaryForeground },
    nutCal: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.primaryForeground + "CC", marginTop: 4 },
    nutBody: { padding: 16 },
    nutRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    nutLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    nutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    ratingBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 8,
      marginTop: 12,
    },
    ratingText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    spacer: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
    empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
  });

  const confColor = (c: number) => {
    if (c > 0.8) return colors.success;
    if (c > 0.5) return colors.fats;
    return colors.destructive;
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>AI Scanner</Text>
          <Text style={s.subtitle}>Identify ingredients or analyze nutrition</Text>
        </View>

        <View style={s.modeRow}>
          {(["ingredients", "nutrition"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[s.modeBtn, mode === m && s.modeBtnActive]}
              onPress={() => {
                setMode(m);
                setIngredients([]);
                setNutrition(null);
                setError(null);
              }}
            >
              <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                {m === "ingredients" ? "Ingredients" : "Nutrition"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.pickRow}>
          <TouchableOpacity style={[s.pickBtn, s.pickBtnPrimary]} onPress={() => pickImage(true)}>
            <Feather name="camera" size={24} color={colors.primaryForeground} />
            <Text style={s.pickBtnTextPrimary}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.pickBtn} onPress={() => pickImage(false)}>
            <Feather name="image" size={24} color={colors.primary} />
            <Text style={[s.pickBtnText, { color: colors.primary }]}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loadingText}>
              {mode === "ingredients" ? "Detecting ingredients..." : "Analyzing nutrition..."}
            </Text>
          </View>
        )}

        {error && !loading && (
          <View style={s.errorBox}>
            <Feather name="alert-circle" size={18} color={colors.destructive} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {!loading && mode === "ingredients" && ingredients.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Detected ({ingredients.length})</Text>
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
              onPress={() => router.push("/(tabs)/recipes")}
            >
              <Feather name="book-open" size={18} color={colors.primaryForeground} />
              <Text style={s.genBtnText}>Generate Recipes</Text>
            </TouchableOpacity>
          </>
        )}

        {!loading && mode === "nutrition" && nutrition && (
          <View style={s.nutCard}>
            <View style={s.nutHeader}>
              <Text style={s.nutFood}>{nutrition.foodName}</Text>
              <Text style={s.nutCal}>{nutrition.calories} kcal per serving</Text>
            </View>
            <View style={s.nutBody}>
              {[
                ["Protein", `${nutrition.protein}g`],
                ["Carbohydrates", `${nutrition.carbs}g`],
                ["Fats", `${nutrition.fats}g`],
                ["Fiber", `${nutrition.fiber}g`],
                ["Sugar", `${nutrition.sugar}g`],
                ["Sodium", `${nutrition.sodium}mg`],
              ].map(([label, value], i, arr) => (
                <View key={label} style={[s.nutRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.nutLabel}>{label}</Text>
                  <Text style={s.nutValue}>{value}</Text>
                </View>
              ))}
              <View
                style={[
                  s.ratingBadge,
                  {
                    backgroundColor:
                      (RATING_COLOR[nutrition.healthRating] ?? colors.accent) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    s.ratingText,
                    { color: RATING_COLOR[nutrition.healthRating] ?? colors.accent },
                  ]}
                >
                  {nutrition.healthRating} — score {nutrition.nutritionScore}/100
                </Text>
              </View>
            </View>
          </View>
        )}

        {!loading && !error && ingredients.length === 0 && !nutrition && (
          <View style={s.empty}>
            <Feather name="aperture" size={40} color={colors.border} />
            <Text style={s.emptyText}>Take a photo or choose from gallery{"\n"}to start analyzing</Text>
          </View>
        )}

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
