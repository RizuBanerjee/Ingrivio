import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroBars } from "@/components/MacroBars";
import { getDailyLog, getNotifications, markAllNotificationsRead } from "@/services/ai";

const { width: SCREEN_W } = Dimensions.get("window");

function DailyView({ todayLog, profileGoal, colors }: {
  todayLog: { entries: { calories: number; protein: number; carbs: number; fats: number }[] };
  profileGoal: number;
  colors: any;
}) {
  const consumed = todayLog.entries.reduce((s, e) => s + e.calories, 0);
  const protein = todayLog.entries.reduce((s, e) => s + e.protein, 0);
  const carbs = todayLog.entries.reduce((s, e) => s + e.carbs, 0);
  const fats = todayLog.entries.reduce((s, e) => s + e.fats, 0);
  const today = new Date();

  return (
    <View>
      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 8 }}>
        {today.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <View style={{ flex: 1, height: 8, backgroundColor: colors.secondary, borderRadius: 4 }}>
          <View style={{
            width: `${Math.min((consumed / (profileGoal || 1)) * 100, 100)}%`,
            height: 8, backgroundColor: colors.primary, borderRadius: 4,
          }} />
        </View>
        <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
          {consumed} / {profileGoal} kcal
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Protein</Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{protein}g</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Carbs</Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{carbs}g</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Fats</Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{fats}g</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { profile, todayLog, addWater } = useApp();
  const { user, dbUser } = useFirebaseAuth();
  const isLoggedIn = !!user;

  const [historyView, setHistoryView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [weeklyData, setWeeklyData] = useState<{ date: Date; calories: number; label: string }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ week: string; calories: number }[]>([]);
  const [weeklyMax, setWeeklyMax] = useState(1);
  const [monthlyMax, setMonthlyMax] = useState(1);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const consumed = todayLog.entries.reduce((s, e) => s + e.calories, 0);
  const protein = todayLog.entries.reduce((s, e) => s + e.protein, 0);
  const carbs = todayLog.entries.reduce((s, e) => s + e.carbs, 0);
  const fats = todayLog.entries.reduce((s, e) => s + e.fats, 0);
  const remaining = Math.max(0, (profile.calorieGoal ?? 2000) - consumed);

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "good_morning" : hour < 17 ? "good_afternoon" : "good_evening";
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  // Name: use DB username first, then Firebase displayName, then profile.name, then "Namaste"
  const greetingName = (dbUser?.username || user?.displayName || profile.name || "Namaste").split(" ")[0];

  const meals = ["breakfast", "lunch", "dinner", "snack"] as const;
  const mealIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    breakfast: "sunny-outline",
    lunch: "partly-sunny-outline",
    dinner: "moon-outline",
    snack: "cafe-outline",
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load real weekly/monthly data from DB whenever todayLog changes (reflects new food entries)
  useEffect(() => {
    const uid = dbUser?.userId || user?.uid;
    if (!uid) return;
    (async () => {
      try {
        const today = new Date();
        // Weekly: last 7 days ending today
        const wd = [];
        for (let i = -6; i <= 0; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          const dateKey = d.toISOString().split("T")[0];
          const log = await getDailyLog(uid, dateKey);
          const cal = log?.totalCalories ?? 0;
          wd.push({ date: d, calories: cal, label: dayNames[d.getDay()] });
        }
        setWeeklyData(wd);
        const maxCal = Math.max(...wd.map((d) => d.calories), (profile.calorieGoal ?? 2000), 1);
        setWeeklyMax(maxCal);

        // Monthly: weeks of current month
        const md = [];
        const y = today.getFullYear();
        const m = today.getMonth();
        const totalDays = new Date(y, m + 1, 0).getDate();
        const weeks = Math.ceil(totalDays / 7);
        for (let w = 0; w < weeks; w++) {
          const weekStart = w * 7 + 1;
          const weekEnd = Math.min(weekStart + 6, totalDays);
          let weekCal = 0;
          for (let d = weekStart; d <= weekEnd; d++) {
            const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const log = await getDailyLog(uid, ds);
            weekCal += log?.totalCalories ?? 0;
          }
          md.push({ week: `Week ${w + 1}`, calories: weekCal });
        }
        setMonthlyData(md);
        setMonthlyMax(Math.max(...md.map((d) => d.calories), 1));
      } catch {}
    })();
  }, [dbUser?.userId, user?.uid, profile.calorieGoal, todayLog]);

  // Poll unread notifications
  useEffect(() => {
    const uid = dbUser?.userId;
    if (!uid) return;
    const check = async () => {
      try {
        const r = await getNotifications(uid);
        setUnreadNotifs(r.notifications.filter((n: any) => !n.read).length);
      } catch {}
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [dbUser?.userId]);

  const maxWeeklyCal = weeklyMax;
  const maxMonthlyCal = monthlyMax;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 28,
    },
    greeting: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 1.2 },
    name: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },
    date: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 4 },
    ringSection: { alignItems: "center", paddingVertical: 20 },
    ringWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
    ringLabel: { position: "absolute", alignItems: "center", justifyContent: "center", top: 0, left: 0, right: 0, bottom: 0 },
    ringCal: { fontSize: 40, fontFamily: "Inter_700Bold", color: colors.foreground },
    ringUnit: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    ringRem: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      marginHorizontal: 20, marginBottom: 12,
      padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 14,
    },
    actionsRow: { flexDirection: "row", gap: 8 },
    actionBtn: {
      flex: 1, backgroundColor: colors.secondary, borderRadius: colors.radius - 6,
      paddingVertical: 16, alignItems: "center", gap: 8,
    },
    actionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    mealRow: {
      flexDirection: "row", alignItems: "center", paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
    },
    mealIcon: {
      width: 36, height: 36, borderRadius: 10, backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    mealName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: colors.foreground, textTransform: "capitalize" },
    mealCal: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.calories },
    waterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    waterCount: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.primary },
    waterInfo: { flex: 1, gap: 2 },
    waterLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    addWaterBtn: {
      backgroundColor: colors.primary, width: 38, height: 38,
      borderRadius: 12, alignItems: "center", justifyContent: "center",
    },
    spacer: { height: Platform.OS === "web" ? 100 : insets.bottom + 120 },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={theme.gradients.header as [string, string, ...string[]]}
          style={s.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={s.greeting}>{t(greetKey)}</Text>
              <Text style={s.name}>{greetingName}</Text>
              <Text style={s.date}>{dateStr}</Text>
            </View>
            <TouchableOpacity
              style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Mark all notifications as read when opening notifications
                if (dbUser?.userId) {
                  markAllNotificationsRead(dbUser.userId).catch(() => {});
                  setUnreadNotifs(0);
                }
                router.push("/notifications");
              }}
            >
              <View style={{ position: "relative" }}>
                <Feather name="bell" size={20} color="#FFFFFF" />
                {unreadNotifs > 0 && (
                  <View style={{
                    position: "absolute", top: -5, right: -6,
                    minWidth: 14, height: 14, borderRadius: 7,
                    backgroundColor: colors.error,
                    alignItems: "center", justifyContent: "center",
                    paddingHorizontal: 3,
                  }}>
                    <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: "#FFFFFF" }}>
                      {unreadNotifs}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={s.ringSection}>
          <View style={s.ringWrap}>
            <CalorieRing consumed={consumed} goal={profile.calorieGoal ?? 0} size={200} />
            <View style={s.ringLabel} pointerEvents="none">
              <Text style={s.ringCal}>{consumed}</Text>
              <Text style={s.ringUnit}>{t("kcal_eaten")}</Text>
              <Text style={s.ringRem}>{remaining} {t("remaining")}</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t("macros")}</Text>
          <MacroBars
            protein={protein} proteinGoal={profile.proteinGoal ?? 0}
            carbs={carbs} carbsGoal={profile.carbsGoal ?? 0}
            fats={fats} fatsGoal={profile.fatsGoal ?? 0}
          />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t("quick_actions")}</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/scan"); }}
            >
              <Feather name="camera" size={22} color={colors.primaryForeground} />
              <Text style={[s.actionLabel, { color: colors.primaryForeground }]}>{t("scan_food")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push("/(tabs)/recipes")}>
              <Feather name="book-open" size={22} color={colors.primary} />
              <Text style={s.actionLabel}>{t("recipes")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push("/(tabs)/chat")}>
              <Feather name="message-circle" size={22} color={colors.primary} />
              <Text style={s.actionLabel}>{t("ask_ai")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t("todays_log")}</Text>
          {meals.map((meal, idx) => {
            const entries = todayLog.entries.filter((e) => e.meal === meal);
            const cal = entries.reduce((sum, e) => sum + e.calories, 0);
            return (
              <View key={meal} style={[s.mealRow, idx === meals.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={s.mealIcon}>
                  <Ionicons name={mealIcons[meal]} size={18} color={colors.primary} />
                </View>
                <Text style={s.mealName}>{t(meal)}</Text>
                <Text style={s.mealCal}>{cal > 0 ? `${cal} kcal` : "—"}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t("water")}</Text>
          <View style={s.waterRow}>
            <Feather name="droplet" size={20} color={colors.primary} />
            <View style={s.waterInfo}>
              <Text style={s.waterCount}>{todayLog.water} / {profile.waterGoal}</Text>
              <Text style={s.waterLabel}>{t("glasses_today")}</Text>
            </View>
            <TouchableOpacity
              style={s.addWaterBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); addWater(1); }}
            >
              <Feather name="plus" size={18} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Diet History Tracking */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Diet History</Text>

          {/* View toggle buttons */}
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
            {(["daily", "weekly", "monthly"] as const).map((v) => (
              <TouchableOpacity
                key={v}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: colors.radius - 6,
                  backgroundColor: historyView === v ? colors.primary : colors.secondary,
                  alignItems: "center",
                }}
                onPress={() => setHistoryView(v)}
              >
                <Text style={{
                  fontSize: 12, fontFamily: "Inter_600SemiBold",
                  color: historyView === v ? colors.primaryForeground : colors.mutedForeground,
                  textTransform: "capitalize",
                }}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Graph views - no Y-axis labels, clean bars */}
          {historyView === "weekly" && (
            <View>
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 8 }}>
                Calories (last 7 days)
              </Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120, paddingBottom: 4 }}>
                {weeklyData.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{ flex: 1, alignItems: "center" }}
                    onPress={() => setSelectedBarIndex(selectedBarIndex === i ? null : i)}
                    activeOpacity={0.8}
                  >
                    {selectedBarIndex === i && (
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 }}>
                        {d.calories}
                      </Text>
                    )}
                    <View style={{
                      width: "100%", height: Math.max((d.calories / maxWeeklyCal) * 100, 4),
                      backgroundColor: d.calories > (profile.calorieGoal ?? 0) ? colors.destructive : colors.primary,
                      borderRadius: 4, opacity: 0.8,
                    }} />
                    <Text style={{ fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>
                      {d.label.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {historyView === "monthly" && (
            <View>
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 8 }}>
                Weekly Calories (this month)
              </Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, height: 120, paddingBottom: 4 }}>
                {monthlyData.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{ flex: 1, alignItems: "center" }}
                    onPress={() => setSelectedBarIndex(selectedBarIndex === i + 100 ? null : i + 100)}
                    activeOpacity={0.8}
                  >
                    {selectedBarIndex === i + 100 && (
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 }}>
                        {d.calories}
                      </Text>
                    )}
                    <View style={{
                      width: "100%", height: Math.max((d.calories / maxMonthlyCal) * 100, 4),
                      backgroundColor: colors.primary, borderRadius: 4, opacity: 0.8,
                    }} />
                    <Text style={{ fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>
                      {d.week}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {historyView === "daily" && (
            <DailyView
              todayLog={todayLog}
              profileGoal={profile.calorieGoal ?? 2000}
              colors={colors}
            />
          )}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
