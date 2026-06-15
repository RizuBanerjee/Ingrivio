import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Dimensions, Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRecipeGradient, getRecipeEmoji } from "@/utils/recipeUtils";

const { width: SW } = Dimensions.get("window");
const CARD_W = SW - 80;

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#40C057", medium: "#FFBA08", hard: "#FF6B35",
};

function RecipeImageSlide({ url, name, index }: { url: string; name: string; index: number }) {
  const [err, setErr] = useState(false);
  const [g1, g2] = getRecipeGradient(name, index);
  const emoji = getRecipeEmoji(name);

  const slideStyle: { width: number; height: number; borderRadius: number; marginLeft: number; marginRight: number; overflow: "hidden" } = {
    width: CARD_W, height: 200, borderRadius: 20,
    marginLeft: 20, marginRight: 8, overflow: "hidden",
  };

  if (!err) {
    return (
      <View style={slideStyle}>
        <Image
          source={{ uri: url }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          onError={() => setErr(true)}
        />
      </View>
    );
  }
  return (
    <LinearGradient
      colors={[g1, g2]}
      style={slideStyle}
      start={{ x: index % 2 === 0 ? 0 : 1, y: 0 }}
      end={{ x: index % 2 === 0 ? 1 : 0, y: 1 }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 70 }}>{emoji}</Text>
      </View>
    </LinearGradient>
  );
}

export default function RecipeDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { generatedRecipes, savedRecipes, saveRecipe, unsaveRecipe, isRecipeSaved, addFoodEntry } = useApp();

  const recipe =
    generatedRecipes.find((r) => r.id === id) ??
    savedRecipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={{ fontSize: 16, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Recipe not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_500Medium", color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isRecipeSaved(recipe.id);
  const diffColor = DIFFICULTY_COLOR[recipe.difficulty] ?? colors.accent;
  const images = [recipe.imageUrl, recipe.imageUrl, recipe.imageUrl];

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
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingHorizontal: 16, paddingBottom: 12,
    },
    navBtn: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      alignItems: "center", justifyContent: "center",
    },
    navBtnActive: { backgroundColor: saved ? colors.primary : colors.card, borderColor: saved ? colors.primary : colors.border },
    imagesRow: { height: 200, marginBottom: 20 },
    name: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground, paddingHorizontal: 20, marginBottom: 6 },
    desc: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, paddingHorizontal: 20, lineHeight: 21, marginBottom: 16 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 20 },
    chip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.secondary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    diffChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
    diffText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 12,
    },
    ingRow: {
      flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    ingName: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    ingAmt: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    step: { flexDirection: "row", gap: 12, marginBottom: 14, alignItems: "flex-start" },
    stepNum: {
      width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center", marginTop: 1,
    },
    stepNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primaryForeground },
    stepText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 },
    tip: { flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" },
    tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 21 },
    nutRow: {
      flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    nutLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    nutVal: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    logGrad: { marginHorizontal: 20, borderRadius: colors.radius, paddingVertical: 16 },
    logBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    logBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    spacer: { height: Platform.OS === "web" ? 34 : insets.bottom + 24 },
  });

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.navBtn, s.navBtnActive]} onPress={handleSave}>
          <Feather name="bookmark" size={18} color={saved ? colors.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Real photo carousel with 3 images */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.imagesRow}
          decelerationRate="fast"
          snapToInterval={CARD_W + 12}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {images.map((url, i) => (
            <RecipeImageSlide key={i} url={url} name={recipe.name} index={i} />
          ))}
        </ScrollView>

        <Text style={s.name}>{recipe.name}</Text>
        <Text style={s.desc}>{recipe.description}</Text>

        <View style={s.metaRow}>
          <View style={s.chip}>
            <Feather name="clock" size={13} color={colors.mutedForeground} />
            <Text style={s.chipText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={s.chip}>
            <Feather name="zap" size={13} color={colors.calories} />
            <Text style={s.chipText}>{recipe.calories} kcal</Text>
          </View>
          <View style={s.chip}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={s.chipText}>{recipe.servings} servings</Text>
          </View>
          <View style={[s.diffChip, { backgroundColor: diffColor + "25" }]}>
            <Text style={[s.diffText, { color: diffColor }]}>{recipe.difficulty}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("ingredients")}</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={[s.ingRow, i === recipe.ingredients.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.ingName}>{ing.name}</Text>
              <Text style={s.ingAmt}>{ing.amount}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("instructions")}</Text>
          {recipe.instructions.map((step, i) => (
            <View key={i} style={s.step}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {recipe.tips.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t("tips")}</Text>
            {recipe.tips.map((tip, i) => (
              <View key={i} style={s.tip}>
                <Feather name="info" size={14} color={colors.accent} />
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("nutrition_per_serving")}</Text>
          {([
            ["Protein", `${recipe.nutritionInfo.protein}g`],
            ["Carbohydrates", `${recipe.nutritionInfo.carbs}g`],
            ["Fats", `${recipe.nutritionInfo.fats}g`],
            ["Fiber", `${recipe.nutritionInfo.fiber}g`],
          ] as [string, string][]).map(([l, v], i, arr) => (
            <View key={l} style={[s.nutRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.nutLabel}>{l}</Text>
              <Text style={s.nutVal}>{v}</Text>
            </View>
          ))}
        </View>

        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={s.logGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity onPress={handleLog} style={s.logBtnInner}>
            <Feather name="plus-circle" size={18} color={colors.primaryForeground} />
            <Text style={s.logBtnText}>{t("log_this_meal")}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
