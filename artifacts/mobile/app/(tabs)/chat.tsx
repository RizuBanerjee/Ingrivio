import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { streamChat } from "@/services/ai";

interface Msg { id: string; role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Dal makhani mein kitni calories hoti hain?",
  "Best Indian breakfast for weight loss?",
  "Is ghee healthy? How much per day?",
  "How to make paneer high-protein?",
  "What are benefits of turmeric (haldi)?",
  "Suggest a healthy Indian thali",
];

export default function ChatScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);

  const uid = () => Date.now().toString() + Math.random().toString(36).substr(2, 6);
  const [lastFailedMsg, setLastFailedMsg] = useState<string | null>(null);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Msg = { id: uid(), role: "user", content: text.trim() };
    const assistantId = uid();
    const hist = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((p) => [{ id: assistantId, role: "assistant", content: "" }, userMsg, ...p]);
    setInput("");
    setStreaming(true);
    setLastFailedMsg(text.trim());

    await streamChat(
      text.trim(), hist,
      (chunk) => setMessages((p) =>
        p.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
      ),
      () => {
        setStreaming(false);
        setLastFailedMsg(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      (err) => {
        setMessages((p) =>
          p.map((m) => m.id === assistantId ? { ...m, content: `Error: ${err}` } : m)
        );
        setStreaming(false);
      }
    );
  };

  const retryLast = () => {
    if (lastFailedMsg) {
      send(lastFailedMsg);
    }
  };

  const inputBarHeight = Platform.OS === "web" ? 100 : insets.bottom + 80;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatarBox: {
      width: 40, height: 40, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    headerName: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
    headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
    clearBtn: {
      marginLeft: "auto", padding: 8,
      backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10,
    },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 120 },
    emptyWrap: { flex: 1, paddingTop: 32 },
    emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "center", marginBottom: 8 },
    emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 24, lineHeight: 21 },
    suggestionsTitle: {
      fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 0.8, marginTop: 24, marginBottom: 10, textAlign: "center",
    },
    suggestion: {
      backgroundColor: colors.card, borderRadius: 12, borderWidth: 1,
      borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8,
    },
    suggestionText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground },
    msgWrap: { marginBottom: 10, maxWidth: "85%" },
    msgWrapUser: { alignSelf: "flex-end" },
    msgWrapAssist: { alignSelf: "flex-start" },
    bubbleUser: {
      borderRadius: 18, borderBottomRightRadius: 4,
      paddingHorizontal: 14, paddingVertical: 10, overflow: "hidden",
    },
    bubbleAssist: {
      borderRadius: 18, borderBottomLeftRadius: 4,
      paddingHorizontal: 14, paddingVertical: 10,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    bubbleTextUser: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.primaryForeground, lineHeight: 22 },
    bubbleTextAssist: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 },
    inputOuter: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      paddingHorizontal: 16,
      paddingBottom: inputBarHeight,
      gap: 0,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
    },
    inputBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      maxHeight: 120,
      minHeight: 44,
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    },
    sendBtnOff: { backgroundColor: colors.border },
  });

  const canSend = input.trim().length > 0 && !streaming;

  const renderMsg = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    if (isUser) {
      return (
        <View style={[s.msgWrap, s.msgWrapUser]}>
          <LinearGradient
            colors={theme.gradients.primary}
            style={s.bubbleUser}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={s.bubbleTextUser}>{item.content}</Text>
          </LinearGradient>
        </View>
      );
    }
    const isError = item.content.startsWith("Error:");
    return (
      <View style={[s.msgWrap, s.msgWrapAssist]}>
        <View style={[s.bubbleAssist, isError && { borderColor: colors.destructive }]}>
          <Text style={[s.bubbleTextAssist, isError && { color: colors.destructive }]}>
            {item.content || (streaming ? "..." : "")}
          </Text>
          {isError && lastFailedMsg && !streaming && (
            <TouchableOpacity
              onPress={retryLast}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, paddingVertical: 4 }}
            >
              <Feather name="refresh-cw" size={13} color={colors.primary} />
              <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.primary }}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <LinearGradient
        colors={theme.gradients.header as [string, string, ...string[]]}
        style={s.headerGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.headerRow}>
          <View style={s.avatarBox}>
            <Feather name="cpu" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={s.headerName}>Nutrition AI</Text>
            <Text style={s.headerSub}>Indian food specialist</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity style={s.clearBtn} onPress={() => setMessages([])}>
              <Feather name="trash-2" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        style={s.list}
        contentContainerStyle={[s.listContent, messages.length === 0 && { flexGrow: 1 }]}
        inverted={true}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyTitle}>{t("ask_me_anything")}</Text>
            <Text style={s.emptySub}>
              Ask about Indian recipes, nutrition, calories, meal planning, and more.
            </Text>
            <Text style={s.suggestionsTitle}>Try asking</Text>
            {SUGGESTIONS.map((sug) => (
              <TouchableOpacity key={sug} style={s.suggestion} onPress={() => send(sug)}>
                <Text style={s.suggestionText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      <View style={s.inputOuter}>
        <View style={s.inputRow}>
          <TextInput
            ref={inputRef}
            style={s.inputBox}
            placeholder="Ask about Indian food & nutrition..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, !canSend && s.sendBtnOff]}
            onPress={() => { send(input); setTimeout(() => inputRef.current?.focus(), 50); }}
            disabled={!canSend}
          >
            {streaming
              ? <ActivityIndicator size="small" color={colors.primaryForeground} />
              : <Feather name="send" size={17} color={canSend ? colors.primaryForeground : colors.mutedForeground} />
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
