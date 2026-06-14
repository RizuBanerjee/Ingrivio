import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroBars } from "@/components/MacroBars";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, todayLog, addWater } = useApp();

  const consumed = todayLog.entries.reduce((s, e) => s + e.calories, 0);
  const protein = todayLog.entries.reduce((s, e) => s + e.protein, 0);
  const carbs = todayLog.entries.reduce((s, e) => s + e.carbs, 0);
  const fats = todayLog.entries.reduce((s, e) => s + e.fats, 0);
  const remaining = Math.max(0, profile.calorieGoal - consumed);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const meals = ["breakfast", "lunch", "dinner", "snack"] as const;
  const mealIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    breakfast: "sunny-outline",
    lunch: "partly-sunny-outline",
    dinner: "moon-outline",
    snack: "cafe-outline",
  };

  const handleWater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addWater(1);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    greeting: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    name: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 },
    date: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 3 },
    ringSection: { alignItems: "center", paddingVertical: 20 },
    ringWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
    ringLabel: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    ringCal: { fontSize: 40, fontFamily: "Inter_700Bold", color: colors.foreground },
    ringUnit: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    ringRem: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 14,
    },
    actionsRow: { flexDirection: "row", gap: 8 },
    actionBtn: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius - 6,
      paddingVertical: 16,
      alignItems: "center",
      gap: 8,
    },
    actionBtnPrimary: { backgroundColor: colors.primary },
    actionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    actionLabelPrimary: { color: colors.primaryForeground },
    mealRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    mealIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    mealName: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textTransform: "capitalize",
    },
    mealCal: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.calories },
    waterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    waterCount: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.primary },
    waterInfo: { flex: 1, gap: 2 },
    waterLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    addWaterBtn: {
      backgroundColor: colors.primary,
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    spacer: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.name}>{profile.name || "Welcome"}</Text>
          <Text style={s.date}>{dateStr}</Text>
        </View>

        <View style={s.ringSection}>
          <View style={s.ringWrap}>
            <CalorieRing consumed={consumed} goal={profile.calorieGoal} size={200} />
            <View style={s.ringLabel} pointerEvents="none">
              <Text style={s.ringCal}>{consumed}</Text>
              <Text style={s.ringUnit}>kcal eaten</Text>
              <Text style={s.ringRem}>{remaining} remaining</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Macros</Text>
          <MacroBars
            protein={protein}
            proteinGoal={profile.proteinGoal}
            carbs={carbs}
            carbsGoal={profile.carbsGoal}
            fats={fats}
            fatsGoal={profile.fatsGoal}
          />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Quick Actions</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnPrimary]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/scan");
              }}
            >
              <Feather name="camera" size={22} color={colors.primaryForeground} />
              <Text style={[s.actionLabel, s.actionLabelPrimary]}>Scan Food</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => router.push("/(tabs)/recipes")}
            >
              <Feather name="book-open" size={22} color={colors.primary} />
              <Text style={s.actionLabel}>Recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => router.push("/(tabs)/chat")}
            >
              <Feather name="message-circle" size={22} color={colors.primary} />
              <Text style={s.actionLabel}>Ask AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Today&apos;s Log</Text>
          {meals.map((meal, idx) => {
            const entries = todayLog.entries.filter((e) => e.meal === meal);
            const cal = entries.reduce((sum, e) => sum + e.calories, 0);
            return (
              <View
                key={meal}
                style={[s.mealRow, idx === meals.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={s.mealIcon}>
                  <Ionicons name={mealIcons[meal]} size={18} color={colors.primary} />
                </View>
                <Text style={s.mealName}>{meal}</Text>
                <Text style={s.mealCal}>{cal > 0 ? `${cal} kcal` : "—"}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Water</Text>
          <View style={s.waterRow}>
            <Feather name="droplet" size={20} color={colors.primary} />
            <View style={s.waterInfo}>
              <Text style={s.waterCount}>
                {todayLog.water} / {profile.waterGoal}
              </Text>
              <Text style={s.waterLabel}>glasses today</Text>
            </View>
            <TouchableOpacity style={s.addWaterBtn} onPress={handleWater}>
              <Feather name="plus" size={18} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
