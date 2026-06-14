import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApp, type UserProfile } from "@/contexts/AppContext";
import { THEMES, type ThemeId } from "@/constants/themes";

const GOALS = [
  { key: "lose", labelKey: "lose_weight" },
  { key: "maintain", labelKey: "maintain" },
  { key: "gain", labelKey: "gain_weight" },
  { key: "muscle", labelKey: "build_muscle" },
] as const;

const DIETARY = ["Vegetarian", "Vegan", "Jain", "Keto", "Gluten-Free", "Dairy-Free", "Non-Veg"];

export default function ProfileScreen() {
  const colors = useColors();
  const { theme, themeId, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, todayLog, savedRecipes } = useApp();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(profile);

  const consumed = todayLog.entries.reduce((s, e) => s + e.calories, 0);
  const bmi = profile.height > 0 ? profile.weight / Math.pow(profile.height / 100, 2) : 0;

  const save = () => {
    updateProfile(draft);
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const initials = (profile.name || "IN")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20, paddingBottom: 28,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    editBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
      backgroundColor: editing ? "#FFFFFF" : "rgba(255,255,255,0.2)",
    },
    editBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: editing ? colors.primary : "#FFFFFF" },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
    avatar: {
      width: 64, height: 64, borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
      alignItems: "center", justifyContent: "center",
    },
    avatarInitial: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    nameEdit: {
      flex: 1, fontSize: 22, fontFamily: "Inter_700Bold",
      color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    },
    profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    goalBadge: {
      alignSelf: "flex-start", marginTop: 4,
      paddingHorizontal: 10, paddingVertical: 3,
      backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8,
    },
    goalBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
    statsRow: { flexDirection: "row", marginHorizontal: 20, marginTop: -14, marginBottom: 12, gap: 10 },
    statCard: {
      flex: 1, backgroundColor: colors.card, borderRadius: colors.radius - 4,
      padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    },
    statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 3 },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      marginHorizontal: 20, marginBottom: 12,
      padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 14,
    },
    themeRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 16 },
    themeSwatch: {
      alignItems: "center", gap: 6,
      borderRadius: 14, padding: 3,
      borderWidth: 2, borderColor: "transparent",
    },
    themeSwatchActive: { borderColor: colors.primary },
    themeGrad: { width: 48, height: 48, borderRadius: 12 },
    themeLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    langRow: { flexDirection: "row", gap: 10 },
    langBtn: {
      flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12,
      borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.secondary,
    },
    langBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + "20" },
    langBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    langBtnTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    field: { marginBottom: 14 },
    fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 6 },
    fieldInput: {
      backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.input,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    fieldValue: { fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground, paddingVertical: 2 },
    goalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    goalBtn: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
      backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
    },
    goalBtnActive: { backgroundColor: colors.primary + "25", borderColor: colors.primary },
    goalBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    goalBtnTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    dietRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    dietChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
    dietChipActive: { backgroundColor: colors.primary + "20", borderColor: colors.primary },
    dietChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    dietChipTextActive: { color: colors.primary, fontFamily: "Inter_500Medium" },
    infoRow: {
      flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    spacer: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradients.hero as [string, string, ...string[]]} style={s.headerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.headerRow}>
            <Text style={s.title}>{t("profile")}</Text>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => { editing ? save() : (setDraft(profile), setEditing(true)); }}
            >
              <Feather name={editing ? "check" : "edit-2"} size={15} color={editing ? colors.primary : "#FFFFFF"} />
              <Text style={s.editBtnText}>{editing ? t("save") : t("edit")}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Text style={s.avatarInitial}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {editing ? (
                <TextInput
                  style={s.nameEdit}
                  value={draft.name}
                  onChangeText={(v) => setDraft((p) => ({ ...p, name: v }))}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              ) : (
                <Text style={s.profileName}>{profile.name || "Set your name"}</Text>
              )}
              <View style={s.goalBadge}>
                <Text style={s.goalBadgeText}>
                  {GOALS.find((g) => g.key === profile.goal)?.labelKey
                    ? t(GOALS.find((g) => g.key === profile.goal)!.labelKey)
                    : ""}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={s.statsRow}>
          {[
            { label: t("today"), value: `${consumed}` },
            { label: t("bmi"), value: bmi > 0 ? bmi.toFixed(1) : "—" },
            { label: t("saved"), value: savedRecipes.length.toString() },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Appearance */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("appearance")}</Text>

          <Text style={s.fieldLabel}>{t("theme")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={s.themeRow}>
              {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map((th) => (
                <TouchableOpacity
                  key={th.id}
                  style={[s.themeSwatch, themeId === th.id && s.themeSwatchActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTheme(th.id); }}
                >
                  <LinearGradient
                    colors={th.gradients.hero as [string, string, ...string[]]}
                    style={s.themeGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={s.themeLabel}>{th.emoji} {th.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={s.fieldLabel}>{t("language")}</Text>
          <View style={s.langRow}>
            {(["en", "hi"] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[s.langBtn, language === lang && s.langBtnActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLanguage(lang); }}
              >
                <Text style={[s.langBtnText, language === lang && s.langBtnTextActive]}>
                  {lang === "en" ? "🇺🇸 English" : "🇮🇳 हिंदी"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Body Stats */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("body_stats")}</Text>
          {([["age", t("age"), "yrs"], ["height", t("height"), "cm"], ["weight", t("weight"), "kg"]] as [keyof UserProfile, string, string][]).map(([key, label, suffix]) => (
            <View key={key} style={s.field}>
              <Text style={s.fieldLabel}>{label}</Text>
              {editing ? (
                <TextInput
                  style={s.fieldInput}
                  value={String(draft[key] ?? "")}
                  onChangeText={(v) => setDraft((p) => ({ ...p, [key]: parseFloat(v) || 0 }))}
                  keyboardType="numeric"
                  placeholder={suffix}
                  placeholderTextColor={colors.mutedForeground}
                />
              ) : (
                <Text style={s.fieldValue}>{String(profile[key])} {suffix}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Goal */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("goal")}</Text>
          <View style={s.goalsRow}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[s.goalBtn, draft.goal === g.key && s.goalBtnActive]}
                onPress={() => { if (!editing) return; setDraft((p) => ({ ...p, goal: g.key })); }}
              >
                <Text style={[s.goalBtnText, draft.goal === g.key && s.goalBtnTextActive]}>{t(g.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("dietary_prefs")}</Text>
          <View style={s.dietRow}>
            {DIETARY.map((d) => {
              const active = (editing ? draft : profile).dietary.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[s.dietChip, active && s.dietChipActive]}
                  onPress={() => {
                    if (!editing) return;
                    setDraft((p) => ({ ...p, dietary: active ? p.dietary.filter((x) => x !== d) : [...p.dietary, d] }));
                  }}
                >
                  <Text style={[s.dietChipText, active && s.dietChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Daily Targets */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("daily_targets")}</Text>
          {([
            ["calorieGoal", "Calories", "kcal"],
            ["proteinGoal", t("protein"), "g"],
            ["carbsGoal", t("carbs"), "g"],
            ["fatsGoal", t("fats"), "g"],
            ["waterGoal", t("water"), "glasses"],
          ] as [keyof UserProfile, string, string][]).map(([key, label, unit], i, arr) => (
            <View key={key} style={[s.infoRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.infoLabel}>{label}</Text>
              {editing ? (
                <TextInput
                  style={[s.fieldInput, { minWidth: 80, textAlign: "right" }]}
                  value={String(draft[key] ?? "")}
                  onChangeText={(v) => setDraft((p) => ({ ...p, [key]: parseFloat(v) || 0 }))}
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />
              ) : (
                <Text style={s.infoValue}>{String(profile[key])} {unit}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
