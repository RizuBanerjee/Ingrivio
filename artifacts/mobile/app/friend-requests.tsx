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
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from "@/services/ai";
import type { FriendRequestRow } from "@/services/ai";

export default function FriendRequestsScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { dbUser } = useFirebaseAuth();

  const [received, setReceived] = useState<FriendRequestRow[]>([]);
  const [sent, setSent] = useState<FriendRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const load = useCallback(async () => {
    if (!dbUser) return;
    setLoading(true);
    try {
      const r = await getFriendRequests(dbUser.userId);
      setReceived(r.received);
      setSent(r.sent);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [dbUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const accept = async (id: number) => {
    if (!dbUser) return;
    try {
      await acceptFriendRequest(id, dbUser.userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await load();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const reject = async (id: number) => {
    if (!dbUser) return;
    try {
      await rejectFriendRequest(id, dbUser.userId);
      await load();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
    tabRow: { flexDirection: "row", gap: 6, marginBottom: 14 },
    tabBtn: {
      flex: 1, paddingVertical: 8, borderRadius: colors.radius - 6,
      backgroundColor: colors.secondary, alignItems: "center",
    },
    tabBtnActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    tabTextActive: { color: colors.primaryForeground },
    userRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    userRowLast: { borderBottomWidth: 0 },
    avatar: {
      width: 44, height: 44, borderRadius: 14, backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary },
    userName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    userId: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    actionRow: { flexDirection: "row", gap: 8, marginLeft: "auto" },
    acceptBtn: {
      backgroundColor: colors.primary, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    rejectBtn: {
      backgroundColor: colors.error + "20", borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    acceptText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    rejectText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.error },
    empty: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center", paddingVertical: 20 },
    spacer: { height: Platform.OS === "web" ? 100 : insets.bottom + 120 },
  });

  const list = activeTab === "received" ? received : sent;

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
            <Text style={s.title}>Friend Requests</Text>
          </View>
        </LinearGradient>

        <View style={[s.card, { marginTop: -14 }]}>
          <View style={s.tabRow}>
            <TouchableOpacity style={[s.tabBtn, activeTab === "received" && s.tabBtnActive]} onPress={() => setActiveTab("received")}>
              <Text style={[s.tabText, activeTab === "received" && s.tabTextActive]}>
                Received {received.length > 0 && `(${received.length})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tabBtn, activeTab === "sent" && s.tabBtnActive]} onPress={() => setActiveTab("sent")}>
              <Text style={[s.tabText, activeTab === "sent" && s.tabTextActive]}>
                Sent {sent.length > 0 && `(${sent.length})`}
              </Text>
            </TouchableOpacity>
          </View>

          {list.length === 0 && (
            <Text style={s.empty}>No {activeTab} requests yet.</Text>
          )}

          {list.map((item, idx) => (
            <View key={item.id} style={[s.userRow, idx === list.length - 1 && s.userRowLast]}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>
                  {(activeTab === "received" ? item.senderUsername : item.receiverUsername).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>
                  {activeTab === "received" ? item.senderUsername : item.receiverUsername}
                </Text>
                <Text style={s.userId}>
                  {activeTab === "received" ? item.senderId : item.receiverId}
                </Text>
              </View>
              {activeTab === "received" && (
                <View style={s.actionRow}>
                  <TouchableOpacity style={s.acceptBtn} onPress={() => accept(item.id)}>
                    <Text style={s.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.rejectBtn} onPress={() => reject(item.id)}>
                    <Text style={s.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
