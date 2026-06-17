import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { getPublicUser } from "@/services/ai";
import type { PublicUser } from "@/services/ai";

const GOALS: Record<string, string> = {
  lose: "Lose Weight", maintain: "Maintain", gain: "Gain Weight", muscle: "Build Muscle",
};

export default function FriendProfileScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const u = await getPublicUser(userId);
        setUser(u);
      } catch {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16, paddingHorizontal: 20, paddingBottom: 28 },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: theme.dark ? "#FFFFFF" : colors.foreground },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
    avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: theme.dark ? "rgba(255,255,255,0.2)" : colors.background + "80", borderWidth: 2, borderColor: theme.dark ? "rgba(255,255,255,0.3)" : colors.border, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: theme.dark ? "#FFFFFF" : colors.foreground },
    profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: theme.dark ? "#FFFFFF" : colors.foreground },
    userId: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)", marginTop: 2 },
    card: { backgroundColor: colors.card, borderRadius: colors.radius, marginHorizontal: 20, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    infoRowLast: { borderBottomWidth: 0 },
    infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    goalBadge: { alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: theme.dark ? "rgba(255,255,255,0.2)" : colors.background + "80", borderRadius: 8 },
    goalText: { fontSize: 12, fontFamily: "Inter_500Medium", color: theme.dark ? "rgba(255,255,255,0.9)" : colors.foreground },
    empty: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center", paddingVertical: 20 },
    spacer: { height: Platform.OS === "web" ? 100 : insets.bottom + 120 },
  });

  const initials = (user?.username || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradients.header as [string, string, ...string[]]} style={s.headerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.title}>Profile</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={{ marginVertical: 20 }} />
          ) : user ? (
            <View style={s.avatarRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileName}>{user.username}</Text>
                <Text style={s.userId}>{user.userId}</Text>
                <View style={s.goalBadge}>
                  <Text style={s.goalText}>{GOALS[user.goal ?? "maintain"] || user.goal || "—"}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={s.empty}>User not found.</Text>
          )}
        </LinearGradient>

        {user && (
          <>
            <View style={[s.card, { marginTop: -14 }]}>
              <Text style={s.cardTitle}>Basic Info</Text>
              {[["Age", user.age != null ? `${user.age} yrs` : "—"],
                ["Height", user.height != null ? `${user.height} cm` : "—"],
                ["Weight", user.weight != null ? `${user.weight} kg` : "—"],
                ["Gender", user.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : "—"],
              ].map(([label, value], i, arr) => (
                <View key={label} style={[s.infoRow, i === arr.length - 1 && s.infoRowLast]}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Dietary</Text>
              {user.dietary && user.dietary.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {user.dietary.map((d) => (
                    <View key={d} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{d}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={s.empty}>No dietary preferences listed.</Text>
              )}
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Daily Targets</Text>
              {[["Calories", user.calorieGoal != null ? `${user.calorieGoal} kcal` : "—"],
                ["Protein", user.proteinGoal != null ? `${user.proteinGoal} g` : "—"],
                ["Carbs", user.carbsGoal != null ? `${user.carbsGoal} g` : "—"],
                ["Fats", user.fatsGoal != null ? `${user.fatsGoal} g` : "—"],
                ["Water", user.waterGoal != null ? `${user.waterGoal} glasses` : "—"],
              ].map(([label, value], i, arr) => (
                <View key={label} style={[s.infoRow, i === arr.length - 1 && s.infoRowLast]}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

          </>
        )}

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
