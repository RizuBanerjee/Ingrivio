import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { getRecipeGradient, getRecipeEmoji } from "@/utils/recipeUtils";
import type { Recipe } from "@/contexts/AppContext";

interface Props {
  recipe: Recipe;
  onPress: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#40C057",
  medium: "#FFBA08",
  hard: "#FF6B35",
};

export function RecipeCard({ recipe, onPress, onSave, isSaved }: Props) {
  const colors = useColors();
  const [g1, g2] = getRecipeGradient(recipe.name, 0);
  const emoji = getRecipeEmoji(recipe.name);

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      overflow: "hidden",
    },
    imageWrap: { height: 160 },
    imageFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
    saveBtn: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isSaved ? colors.primary : "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    body: { padding: 14 },
    name: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 4,
    },
    description: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 18,
      marginBottom: 12,
    },
    metaRow: { flexDirection: "row", gap: 12, flexWrap: "wrap", alignItems: "center" },
    meta: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  });

  const diffColor = DIFFICULTY_COLOR[recipe.difficulty] ?? colors.mutedForeground;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.imageWrap}>
        <LinearGradient colors={[g1, g2]} style={s.imageWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.imageFallback}>
            <Text style={{ fontSize: 52 }}>{emoji}</Text>
          </View>
        </LinearGradient>
        {onSave && (
          <TouchableOpacity style={s.saveBtn} onPress={onSave}>
            <Feather name="bookmark" size={17} color={isSaved ? colors.primaryForeground : "#fff"} />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.body}>
        <Text style={s.name} numberOfLines={1}>{recipe.name}</Text>
        <Text style={s.description} numberOfLines={2}>{recipe.description}</Text>
        <View style={s.metaRow}>
          <View style={s.meta}>
            <Feather name="clock" size={13} color={colors.mutedForeground} />
            <Text style={s.metaText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={s.meta}>
            <Feather name="zap" size={13} color={colors.calories} />
            <Text style={s.metaText}>{recipe.calories} kcal</Text>
          </View>
          <View style={s.meta}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={s.metaText}>{recipe.servings} serv.</Text>
          </View>
          <View style={[s.badge, { backgroundColor: diffColor + "25" }]}>
            <Text style={[s.badgeText, { color: diffColor }]}>{recipe.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
