import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe } from "@/contexts/AppContext";

type Tab = "generated" | "saved";

export default function RecipesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    scannedIngredients,
    generatedRecipes,
    setGeneratedRecipes,
    savedRecipes,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
  } = useApp();

  const [tab, setTab] = useState<Tab>("generated");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recipes: Recipe[] = tab === "generated" ? generatedRecipes : savedRecipes;
  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const openRecipe = (recipe: Recipe) => {
    const allRecipes = [...generatedRecipes, ...savedRecipes];
    if (!allRecipes.find((r) => r.id === recipe.id)) {
      setGeneratedRecipes([recipe, ...generatedRecipes]);
    }
    router.push(`/recipe/${recipe.id}`);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius - 4,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 12,
      height: 44,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    genBanner: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    genBannerInfo: { flex: 1 },
    genBannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    genBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.primaryForeground + "BB", marginTop: 2 },
    tabRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius - 4,
      padding: 4,
      marginBottom: 16,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 9,
      alignItems: "center",
      borderRadius: colors.radius - 8,
    },
    tabBtnActive: {
      backgroundColor: colors.card,
    },
    tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    tabTextActive: { fontFamily: "Inter_600SemiBold", color: colors.primary },
    loadingBox: { paddingVertical: 40, alignItems: "center", gap: 12 },
    loadingText: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    errorBox: {
      marginHorizontal: 20,
      backgroundColor: colors.destructive + "15",
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    errorText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.destructive },
    empty: { alignItems: "center", paddingVertical: 60, gap: 14 },
    emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 40 },
    listContent: { paddingHorizontal: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Recipes</Text>
      </View>

      <View style={s.searchRow}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {scannedIngredients.length > 0 && (
        <View style={s.genBanner}>
          <Feather name="zap" size={22} color={colors.primaryForeground} />
          <View style={s.genBannerInfo}>
            <Text style={s.genBannerTitle}>
              {scannedIngredients.length} ingredient{scannedIngredients.length > 1 ? "s" : ""} detected
            </Text>
            <Text style={s.genBannerSub}>Go to Scan tab to generate recipes</Text>
          </View>
        </View>
      )}

      {error && (
        <View style={s.errorBox}>
          <Feather name="alert-circle" size={16} color={colors.destructive} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <View style={s.tabRow}>
        {(["generated", "saved"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === "generated" ? "Generated" : "Saved"}{" "}
              {t === "generated" && generatedRecipes.length > 0 ? `(${generatedRecipes.length})` : ""}
              {t === "saved" && savedRecipes.length > 0 ? `(${savedRecipes.length})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => openRecipe(item)}
              onSave={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                isRecipeSaved(item.id) ? unsaveRecipe(item.id) : saveRecipe(item);
              }}
              isSaved={isRecipeSaved(item.id)}
            />
          )}
          contentContainerStyle={s.listContent}
          scrollEnabled={!!filtered.length}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="book-open" size={40} color={colors.border} />
              <Text style={s.emptyTitle}>
                {tab === "generated" ? "No recipes yet" : "No saved recipes"}
              </Text>
              <Text style={s.emptyText}>
                {tab === "generated"
                  ? "Scan ingredients and tap Generate to get AI-powered recipes"
                  : "Save recipes from the Generated tab to find them here"}
              </Text>
            </View>
          }
        />
    </View>
  );
}
