import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, type UserProfile } from "@/contexts/AppContext";

const GOALS = [
  { key: "lose", label: "Lose Weight" },
  { key: "maintain", label: "Maintain" },
  { key: "gain", label: "Gain Weight" },
  { key: "muscle", label: "Build Muscle" },
] as const;

const DIETARY = ["Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "Dairy-Free"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, todayLog, generatedRecipes, savedRecipes } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(profile);

  const consumed = todayLog.entries.reduce((s, e) => s + e.calories, 0);

  const bmi =
    profile.height > 0 ? profile.weight / Math.pow(profile.height / 100, 2) : 0;
  const bmiLabel =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";

  const save = () => {
    updateProfile(draft);
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggle = (d: string) => {
    setDraft((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(d)
        ? prev.dietary.filter((x) => x !== d)
        : [...prev.dietary, d],
    }));
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: editing ? colors.primary : colors.secondary,
      borderRadius: 12,
    },
    editBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: editing ? colors.primaryForeground : colors.primary,
    },
    avatarSection: { alignItems: "center", paddingVertical: 24 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarInitial: { fontSize: 32, fontFamily: "Inter_700Bold", color: colors.primaryForeground },
    profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    goalBadge: {
      marginTop: 6,
      paddingHorizontal: 12,
      paddingVertical: 4,
      backgroundColor: colors.secondary,
      borderRadius: 10,
    },
    goalBadgeText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.primary },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 12,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius - 4,
      padding: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 3 },
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
    field: { marginBottom: 14 },
    fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 6 },
    fieldInput: {
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.input,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    fieldValue: { fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground, paddingVertical: 2 },
    goalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    goalBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    goalBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    goalBtnTextActive: { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" },
    dietRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    dietChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dietChipActive: { backgroundColor: colors.primary + "20", borderColor: colors.primary },
    dietChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    dietChipTextActive: { color: colors.primary, fontFamily: "Inter_500Medium" },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    saveBtn: {
      margin: 20,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    spacer: { height: Platform.OS === "web" ? 34 : insets.bottom + 80 },
  });

  const initials = draft.name
    ? draft.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <Text style={s.title}>Profile</Text>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => {
                if (editing) {
                  save();
                } else {
                  setDraft(profile);
                  setEditing(true);
                }
              }}
            >
              <Feather
                name={editing ? "check" : "edit-2"}
                size={15}
                color={editing ? colors.primaryForeground : colors.primary}
              />
              <Text style={s.editBtnText}>{editing ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarInitial}>{initials}</Text>
          </View>
          {editing ? (
            <TextInput
              style={[s.fieldInput, { textAlign: "center", fontSize: 18, fontFamily: "Inter_600SemiBold" }]}
              value={draft.name}
              onChangeText={(v) => setDraft((p) => ({ ...p, name: v }))}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
            />
          ) : (
            <Text style={s.profileName}>{profile.name || "Set your name"}</Text>
          )}
          <View style={s.goalBadge}>
            <Text style={s.goalBadgeText}>
              Goal: {GOALS.find((g) => g.key === profile.goal)?.label ?? ""}
            </Text>
          </View>
        </View>

        <View style={s.statsRow}>
          {[
            { label: "Today", value: `${consumed} kcal` },
            { label: "BMI", value: bmi > 0 ? bmi.toFixed(1) : "—" },
            { label: "Saved", value: savedRecipes.length.toString() },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Body Stats</Text>
          {[
            { key: "age", label: "Age", suffix: "yrs" },
            { key: "height", label: "Height", suffix: "cm" },
            { key: "weight", label: "Weight", suffix: "kg" },
          ].map(({ key, label, suffix }) => (
            <View key={key} style={s.field}>
              <Text style={s.fieldLabel}>{label}</Text>
              {editing ? (
                <TextInput
                  style={s.fieldInput}
                  value={String(draft[key as keyof UserProfile] ?? "")}
                  onChangeText={(v) =>
                    setDraft((p) => ({ ...p, [key]: parseFloat(v) || 0 }))
                  }
                  keyboardType="numeric"
                  placeholder={suffix}
                  placeholderTextColor={colors.mutedForeground}
                />
              ) : (
                <Text style={s.fieldValue}>
                  {profile[key as keyof UserProfile]} {suffix}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Goal</Text>
          <View style={s.goalsRow}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[s.goalBtn, draft.goal === g.key && s.goalBtnActive]}
                onPress={() => {
                  if (!editing) return;
                  setDraft((p) => ({ ...p, goal: g.key }));
                }}
              >
                <Text
                  style={[s.goalBtnText, draft.goal === g.key && s.goalBtnTextActive]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Dietary Preferences</Text>
          <View style={s.dietRow}>
            {DIETARY.map((d) => {
              const active = (editing ? draft : profile).dietary.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[s.dietChip, active && s.dietChipActive]}
                  onPress={() => {
                    if (!editing) return;
                    toggle(d);
                  }}
                >
                  <Text style={[s.dietChipText, active && s.dietChipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Daily Targets</Text>
          {[
            { label: "Calories", value: `${profile.calorieGoal} kcal`, key: "calorieGoal" },
            { label: "Protein", value: `${profile.proteinGoal}g`, key: "proteinGoal" },
            { label: "Carbs", value: `${profile.carbsGoal}g`, key: "carbsGoal" },
            { label: "Fats", value: `${profile.fatsGoal}g`, key: "fatsGoal" },
            { label: "Water", value: `${profile.waterGoal} glasses`, key: "waterGoal" },
          ].map(({ label, value, key }, i, arr) => (
            <View key={label} style={[s.infoRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.infoLabel}>{label}</Text>
              {editing ? (
                <TextInput
                  style={[s.fieldInput, { minWidth: 80, textAlign: "right" }]}
                  value={String(draft[key as keyof UserProfile] ?? "")}
                  onChangeText={(v) =>
                    setDraft((p) => ({ ...p, [key]: parseFloat(v) || 0 }))
                  }
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />
              ) : (
                <Text style={s.infoValue}>{value}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
