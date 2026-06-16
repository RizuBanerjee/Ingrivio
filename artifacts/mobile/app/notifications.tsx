import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { getNotifications, markNotificationRead } from "@/services/ai";
import type { NotificationRow } from "@/services/ai";

export default function NotificationsScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { dbUser } = useFirebaseAuth();

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!dbUser) return;
    try {
      const r = await getNotifications(dbUser.userId);
      setNotifications(r.notifications);
    } catch {}
  }, [dbUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  React.useEffect(() => { load(); }, [load]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20, paddingBottom: 28,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: theme.dark ? "#FFFFFF" : colors.foreground },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      marginHorizontal: 20, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 14,
    },
    notifRow: {
      flexDirection: "row", alignItems: "flex-start", gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    notifRowLast: { borderBottomWidth: 0 },
    dot: {
      width: 10, height: 10, borderRadius: 5, marginTop: 4,
    },
    notifContent: { flex: 1 },
    notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    notifTime: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 },
    empty: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center", paddingVertical: 20 },
    spacer: { height: Platform.OS === "web" ? 100 : insets.bottom + 120 },
  });

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={theme.gradients.header as [string, string, ...string[]]} style={s.headerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.title}>Notifications</Text>
          </View>
        </LinearGradient>

        <View style={[s.card, { marginTop: -14 }]}>
          <Text style={s.cardTitle}>{notifications.filter((n) => !n.read).length} Unread</Text>

          {notifications.length === 0 && (
            <Text style={s.empty}>No notifications yet.</Text>
          )}

          {notifications.map((n, idx) => (
            <TouchableOpacity
              key={n.id}
              style={[s.notifRow, idx === notifications.length - 1 && s.notifRowLast]}
              onPress={() => {
                if (!n.read) markRead(n.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <View style={[s.dot, { backgroundColor: n.read ? colors.border : colors.primary }]} />
              <View style={s.notifContent}>
                <Text style={[s.notifTitle, { color: n.read ? colors.mutedForeground : colors.foreground }]}>
                  {n.title}
                </Text>
                <Text style={s.notifBody}>{n.body}</Text>
                <Text style={s.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
