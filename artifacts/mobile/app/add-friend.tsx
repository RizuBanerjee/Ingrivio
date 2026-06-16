import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { searchUserById, sendFriendRequest } from "@/services/ai";
import type { PublicUser } from "@/services/ai";

export default function AddFriendScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { dbUser } = useFirebaseAuth();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean; user?: PublicUser } | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSentTo(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const r = await searchUserById(query.trim());
      setResult(r);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (receiver: PublicUser) => {
    if (!dbUser) return;
    try {
      const r = await sendFriendRequest(dbUser.userId, receiver.userId);
      if (r.alreadyFriends) {
        setError("You are already friends with this user.");
      } else if (r.alreadySent) {
        setSentTo(receiver.userId);
      } else {
        setSentTo(receiver.userId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setError("Failed to send request.");
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20, paddingBottom: 28,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: theme.dark ? "#FFFFFF" : colors.foreground },
    searchBox: {
      flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
    },
    searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground },
    searchBtn: {
      backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      marginHorizontal: 20, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 14,
    },
    userRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
    avatar: {
      width: 48, height: 48, borderRadius: 16, backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    userName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    userId: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    actionBtn: {
      backgroundColor: colors.primary, borderRadius: 10,
      paddingHorizontal: 16, paddingVertical: 10, alignItems: "center", marginTop: 8,
    },
    actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    sentText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 8 },
    notFound: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center", marginTop: 8 },
    errorText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.error, textAlign: "center", marginTop: 8 },
    spacer: { height: Platform.OS === "web" ? 100 : insets.bottom + 120 },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradients.header as [string, string, ...string[]]} style={s.headerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.title}>Add Friend</Text>
          </View>
          <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" }}>
            Search by user ID to add a friend
          </Text>
        </LinearGradient>

        <View style={[s.card, { marginTop: -14 }]}>
          <View style={s.searchBox}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={s.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="e.g. #12d5fsc6"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={search}
            />
            <TouchableOpacity style={s.searchBtn} onPress={search} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Feather name="arrow-right" size={16} color={colors.primaryForeground} />}
            </TouchableOpacity>
          </View>

          {result?.found && result.user && (
            <View style={s.userRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{result.user.username?.charAt(0).toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{result.user.username}</Text>
                <Text style={s.userId}>{result.user.userId}</Text>
              </View>
            </View>
          )}

          {result?.found && result.user && (
            sentTo === result.user.userId ? (
              <Text style={s.sentText}>Friend request sent</Text>
            ) : (
              <TouchableOpacity style={s.actionBtn} onPress={() => sendRequest(result.user!)}>
                <Text style={s.actionText}>Send Friend Request</Text>
              </TouchableOpacity>
            )
          )}

          {result && !result.found && (
            <Text style={s.notFound}>User ID not found. Please check the ID and try again.</Text>
          )}

          {error && <Text style={s.errorText}>{error}</Text>}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </View>
  );
}
