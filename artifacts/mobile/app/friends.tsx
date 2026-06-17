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
import { getFriends, removeFriend } from "@/services/ai";
import type { FriendRow } from "@/services/ai";

export default function FriendsScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { dbUser } = useFirebaseAuth();

  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!dbUser) return;
    try {
      const r = await getFriends(dbUser.userId);
      setFriends(r.friends);
    } catch {}
  }, [dbUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!dbUser || removing) return;
    setRemoving(friendId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await removeFriend(dbUser.userId, friendId);
      setFriends((prev) => prev.filter((f) => f.friendId !== friendId));
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRemoving(null);
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
    userRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    userRowLast: { borderBottomWidth: 0 },
    avatar: {
      width: 48, height: 48, borderRadius: 16, backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    userName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    userId: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
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
            <Text style={s.title}>Friends</Text>
          </View>
        </LinearGradient>

        <View style={[s.card, { marginTop: -14 }]}>
          <Text style={s.cardTitle}>{friends.length} {friends.length === 1 ? "Friend" : "Friends"}</Text>

          {friends.length === 0 && (
            <Text style={s.empty}>No friends yet. Tap Add Friend to get started.</Text>
          )}

          {friends.map((friend, idx) => (
            <View key={friend.id} style={[s.userRow, idx === friends.length - 1 && s.userRowLast]}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/friend-profile?userId=${encodeURIComponent(friend.friendId)}`);
                }}
                activeOpacity={0.7}
              >
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{friend.friendUsername.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{friend.friendUsername}</Text>
                  <Text style={s.userId}>{friend.friendId}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemoveFriend(friend.friendId)}
                style={{
                  padding: 8, borderRadius: 8,
                  backgroundColor: colors.error + "15",
                }}
                disabled={removing === friend.friendId}
              >
                <Feather name="x" size={16} color={removing === friend.friendId ? colors.border : colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
