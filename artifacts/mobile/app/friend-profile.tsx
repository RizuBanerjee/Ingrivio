import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { getPublicUser, getDailyLog } from "@/services/ai";
import type { PublicUser } from "@/services/ai";

const { width: SCREEN_W } = Dimensions.get("window");

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
  const [historyView, setHistoryView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ date: Date; calories: number; label: string }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ week: string; calories: number }[]>([]);
  const [weeklyMax, setWeeklyMax] = useState(1);
  const [monthlyMax, setMonthlyMax] = useState(1);
  const [selectedDayData, setSelectedDayData] = useState<{ calories: number; protein: number; carbs: number; fats: number } | null>(null);
  const [dayDataLoading, setDayDataLoading] = useState(false);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const calMonth = selectedDate.getMonth();
  const calYear = selectedDate.getFullYear();
  const numDays = new Date(calYear, calMonth + 1, 0).getDate();
  const startDay = new Date(calYear, calMonth, 1).getDay();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const isToday = (day: number) => isSameDay(new Date(calYear, calMonth, day), today);
  const isSelected = (day: number) => isSameDay(new Date(calYear, calMonth, day), selectedDate);

  const navigateMonth = (dir: number) => {
    setSelectedDate(new Date(calYear, calMonth + dir, 1));
  };

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

  // Load daily data for selected date
  useEffect(() => {
    if (!userId) return;
    const dateKey = selectedDate.toISOString().split("T")[0];
    setDayDataLoading(true);
    getDailyLog(userId, dateKey)
      .then((log) => {
        setSelectedDayData({
          calories: log?.totalCalories ?? 0,
          protein: log?.totalProtein ?? 0,
          carbs: log?.totalCarbs ?? 0,
          fats: log?.totalFats ?? 0,
        });
      })
      .catch(() => setSelectedDayData(null))
      .finally(() => setDayDataLoading(false));
  }, [userId, selectedDate]);

  // Load weekly and monthly data from per-date API calls
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // Weekly: 7 days centered on selected date
        const wd = [];
        for (let i = -3; i <= 3; i++) {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() + i);
          const dateKey = d.toISOString().split("T")[0];
          const log = await getDailyLog(userId, dateKey);
          const cal = log?.totalCalories ?? 0;
          wd.push({ date: d, calories: cal, label: dayNames[d.getDay()] });
        }
        setWeeklyData(wd);
        const wMax = Math.max(...wd.map((d) => d.calories), (user?.calorieGoal ?? 2000), 1);
        setWeeklyMax(wMax);

        // Monthly: weeks of selected month
        const md = [];
        const y = selectedDate.getFullYear();
        const m = selectedDate.getMonth();
        const totalDays = new Date(y, m + 1, 0).getDate();
        const weeks = Math.ceil(totalDays / 7);
        for (let w = 0; w < weeks; w++) {
          const weekStart = w * 7 + 1;
          const weekEnd = Math.min(weekStart + 6, totalDays);
          let weekCal = 0;
          for (let d = weekStart; d <= weekEnd; d++) {
            const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const log = await getDailyLog(userId, ds);
            weekCal += log?.totalCalories ?? 0;
          }
          md.push({ week: `Week ${w + 1}`, calories: weekCal });
        }
        setMonthlyData(md);
        setMonthlyMax(Math.max(...md.map((d) => d.calories), 1));
      } catch {}
    })();
  }, [userId, selectedDate, user?.calorieGoal]);

  // Nice rounded axis labels — 4 evenly spaced values
  const niceAxis = (max: number) => {
    if (max <= 0) return [0, 0, 0, 0];
    const digits = Math.floor(Math.log10(max));
    const base = Math.pow(10, digits);
    const ratio = max / base;
    let niceMax: number;
    if (ratio <= 1.2) niceMax = base;
    else if (ratio <= 2.5) niceMax = base * 2.5;
    else if (ratio <= 5) niceMax = base * 5;
    else niceMax = base * 10;
    const step = niceMax / 3;
    return [
      Math.round(niceMax),
      Math.round(niceMax - step),
      Math.round(niceMax - step * 2),
      0,
    ];
  };

  const wAxis = niceAxis(weeklyMax);
  const mAxis = niceAxis(monthlyMax);
  const maxWeeklyCal = weeklyMax;
  const maxMonthlyCal = monthlyMax;

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

  const selectedCal = selectedDayData?.calories ?? 0;
  const selectedProtein = selectedDayData?.protein ?? 0;
  const selectedCarbs = selectedDayData?.carbs ?? 0;
  const selectedFats = selectedDayData?.fats ?? 0;

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

            {/* Diet History with Interactive Charts */}
            <View style={s.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Text style={s.cardTitle}>Diet History</Text>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  onPress={() => setShowCalendar(!showCalendar)}
                >
                  <Feather name="calendar" size={14} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary }}>
                    {showCalendar ? "Hide" : "Calendar"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* View toggle */}
              <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
                {(["daily", "weekly", "monthly"] as const).map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={{ flex: 1, paddingVertical: 8, borderRadius: colors.radius - 6, backgroundColor: historyView === v ? colors.primary : colors.secondary, alignItems: "center" }}
                    onPress={() => { setHistoryView(v); setSelectedBarIndex(null); }}
                  >
                    <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: historyView === v ? colors.primaryForeground : colors.mutedForeground, textTransform: "capitalize" }}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Calendar */}
              {showCalendar && (
                <View style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => navigateMonth(-1)}>
                      <Feather name="chevron-left" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                      {selectedDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth(1)}>
                      <Feather name="chevron-right" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    {dayNames.map((d) => (
                      <View key={d} style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{d}</Text>
                      </View>
                    ))}
                  </View>
                  {Array.from({ length: Math.ceil((startDay + numDays) / 7) }).map((_, rowIdx) => (
                    <View key={`row-${rowIdx}`} style={{ flexDirection: "row" }}>
                      {Array.from({ length: 7 }).map((_, colIdx) => {
                        const cellIdx = rowIdx * 7 + colIdx;
                        const day = cellIdx - startDay + 1;
                        if (day < 1 || day > numDays) return <View key={`cell-${rowIdx}-${colIdx}`} style={{ flex: 1, height: 36 }} />;
                        const todayFlag = isToday(day);
                        const selectedFlag = isSelected(day);
                        return (
                          <TouchableOpacity
                            key={day}
                            style={{ flex: 1, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: selectedFlag ? colors.primary : todayFlag ? colors.primary + "30" : "transparent" }}
                            onPress={() => { setSelectedDate(new Date(calYear, calMonth, day)); setShowCalendar(false); setHistoryView("daily"); setSelectedBarIndex(null); }}
                          >
                            <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: selectedFlag ? colors.primaryForeground : todayFlag ? colors.primary : colors.foreground }}>{day}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}

              {/* Daily view */}
              {historyView === "daily" && (
                <View>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 8 }}>
                    {selectedDate.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
                  </Text>
                  {dayDataLoading ? (
                    <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: "center", paddingVertical: 12 }}>Loading...</Text>
                  ) : selectedDayData ? (
                    <>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <View style={{ flex: 1, height: 8, backgroundColor: colors.secondary, borderRadius: 4 }}>
                          <View style={{ width: `${Math.min((selectedCal / (user.calorieGoal ?? 1)) * 100, 100)}%`, height: 8, backgroundColor: colors.primary, borderRadius: 4 }} />
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                          {selectedCal} / {user.calorieGoal ?? 0} kcal
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 8, alignItems: "center" }}>
                          <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Protein</Text>
                          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{selectedProtein}g</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 8, alignItems: "center" }}>
                          <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Carbs</Text>
                          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{selectedCarbs}g</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 8, alignItems: "center" }}>
                          <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Fats</Text>
                          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{selectedFats}g</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={s.empty}>No data for this date.</Text>
                  )}
                </View>
              )}

              {/* Weekly chart */}
              {historyView === "weekly" && (
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Calories (7 days)</Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>kcal</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, height: 120, paddingBottom: 4 }}>
                    <View style={{ width: 32, justifyContent: "space-between", alignItems: "flex-end", paddingRight: 4 }}>
                      {wAxis.map((val, idx) => (
                        <Text key={idx} style={{ fontSize: 8, color: colors.mutedForeground }}>
                          {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        </Text>
                      ))}
                    </View>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
                      {weeklyData.map((d, i) => (
                        <TouchableOpacity key={i} style={{ flex: 1, alignItems: "center" }} onPress={() => setSelectedBarIndex(selectedBarIndex === i ? null : i)} activeOpacity={0.8}>
                          {selectedBarIndex === i && (
                            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 }}>{d.calories}</Text>
                          )}
                          <View style={{ width: "100%", height: Math.max((d.calories / maxWeeklyCal) * 100, 4), backgroundColor: d.calories > (user.calorieGoal ?? 0) ? colors.destructive : colors.primary, borderRadius: 4, opacity: 0.8 }} />
                          <Text style={{ fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>{d.label.slice(0, 3)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Monthly chart */}
              {historyView === "monthly" && (
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Weekly Calories</Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>kcal</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, height: 120, paddingBottom: 4 }}>
                    <View style={{ width: 32, justifyContent: "space-between", alignItems: "flex-end", paddingRight: 4 }}>
                      {mAxis.map((val, idx) => (
                        <Text key={idx} style={{ fontSize: 8, color: colors.mutedForeground }}>
                          {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        </Text>
                      ))}
                    </View>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
                      {monthlyData.map((d, i) => (
                        <TouchableOpacity key={i} style={{ flex: 1, alignItems: "center" }} onPress={() => setSelectedBarIndex(selectedBarIndex === i + 100 ? null : i + 100)} activeOpacity={0.8}>
                          {selectedBarIndex === i + 100 && (
                            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 }}>{d.calories}</Text>
                          )}
                          <View style={{ width: "100%", height: Math.max((d.calories / maxMonthlyCal) * 100, 4), backgroundColor: colors.primary, borderRadius: 4, opacity: 0.8 }} />
                          <Text style={{ fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>{d.week}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
