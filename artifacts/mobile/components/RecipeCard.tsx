import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
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

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      overflow: "hidden",
    },
    imagePlaceholder: {
      height: 140,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    body: { padding: 14 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    name: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      flex: 1,
      marginRight: 8,
    },
    description: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
      lineHeight: 18,
    },
    metaRow: { flexDirection: "row", gap: 16, marginTop: 12, flexWrap: "wrap" },
    meta: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    saveBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const diffColor = DIFFICULTY_COLOR[recipe.difficulty] ?? colors.mutedForeground;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imagePlaceholder}>
        <Feather name="image" size={32} color={colors.border} />
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {recipe.name}
          </Text>
          {onSave && (
            <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
              <Feather
                name={isSaved ? "bookmark" : "bookmark"}
                size={18}
                color={isSaved ? colors.primary : colors.mutedForeground}
                solid={isSaved}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Feather name="clock" size={13} color={colors.mutedForeground} />
            <Text style={styles.metaText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={styles.meta}>
            <Feather name="zap" size={13} color={colors.calories} />
            <Text style={styles.metaText}>{recipe.calories} kcal</Text>
          </View>
          <View style={styles.meta}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: diffColor + "20" }]}>
            <Text style={[styles.badgeText, { color: diffColor }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
