import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#40C057",
  medium: "#FFBA08",
  hard: "#FF6B35",
};

export default function RecipeDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { generatedRecipes, savedRecipes, saveRecipe, unsaveRecipe, isRecipeSaved, addFoodEntry } = useApp();

  const recipe =
    generatedRecipes.find((r) => r.id === id) ??
    savedRecipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={{ fontSize: 16, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 12 }}>
          Recipe not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_500Medium", color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isRecipeSaved(recipe.id);
  const diffColor = DIFFICULTY_COLOR[recipe.difficulty] ?? colors.accent;

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saved ? unsaveRecipe(recipe.id) : saveRecipe(recipe);
  };

  const handleLog = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addFoodEntry({
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.nutritionInfo.protein,
      carbs: recipe.nutritionInfo.carbs,
      fats: recipe.nutritionInfo.fats,
      meal: "dinner",
    });
    router.back();
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: saved ? colors.primary : colors.card,
      borderWidth: 1,
      borderColor: saved ? colors.primary : colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      height: 180,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 20,
      borderRadius: colors.radius,
      marginBottom: 20,
    },
    name: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground, paddingHorizontal: 20, marginBottom: 8 },
    description: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground, paddingHorizontal: 20, lineHeight: 22, marginBottom: 16 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginBottom: 20 },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    metaText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    diffChip: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
    },
    diffText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
    },
    ingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    ingName: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    ingAmount: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    stepRow: { flexDirection: "row", gap: 12, marginBottom: 14, alignItems: "flex-start" },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primaryForeground },
    stepText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 },
    tipRow: { flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" },
    tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 21 },
    nutRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    nutLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    nutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    logBtn: {
      marginHorizontal: 20,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    logBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    spacer: { height: Platform.OS === "web" ? 34 : insets.bottom + 24 },
  });

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Feather name="bookmark" size={18} color={saved ? colors.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Feather name="image" size={40} color={colors.border} />
        </View>

        <Text style={s.name}>{recipe.name}</Text>
        <Text style={s.description}>{recipe.description}</Text>

        <View style={s.metaRow}>
          <View style={s.metaChip}>
            <Feather name="clock" size={13} color={colors.mutedForeground} />
            <Text style={s.metaText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={s.metaChip}>
            <Feather name="zap" size={13} color={colors.calories} />
            <Text style={s.metaText}>{recipe.calories} kcal</Text>
          </View>
          <View style={s.metaChip}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={s.metaText}>{recipe.servings} servings</Text>
          </View>
          <View style={[s.diffChip, { backgroundColor: diffColor + "20" }]}>
            <Text style={[s.diffText, { color: diffColor }]}>{recipe.difficulty}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={[s.ingRow, i === recipe.ingredients.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.ingName}>{ing.name}</Text>
              <Text style={s.ingAmount}>{ing.amount}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {recipe.tips.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tips</Text>
            {recipe.tips.map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <Feather name="info" size={14} color={colors.accent} />
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Nutrition per serving</Text>
          {[
            ["Protein", `${recipe.nutritionInfo.protein}g`],
            ["Carbohydrates", `${recipe.nutritionInfo.carbs}g`],
            ["Fats", `${recipe.nutritionInfo.fats}g`],
            ["Fiber", `${recipe.nutritionInfo.fiber}g`],
          ].map(([l, v], i, arr) => (
            <View key={l} style={[s.nutRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.nutLabel}>{l}</Text>
              <Text style={s.nutValue}>{v}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.logBtn} onPress={handleLog}>
          <Feather name="plus-circle" size={18} color={colors.primaryForeground} />
          <Text style={s.logBtnText}>Log This Meal</Text>
        </TouchableOpacity>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
