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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { streamChat } from "@/services/ai";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What foods are high in protein?",
  "How many calories should I eat to lose weight?",
  "Give me a healthy breakfast idea",
  "What are good pre-workout snacks?",
  "How do I reduce sugar cravings?",
];

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const uid = () => Date.now().toString() + Math.random().toString(36).substr(2, 6);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Msg = { id: uid(), role: "user", content: text.trim() };
    const assistantId = uid();

    const currentMessages = messages;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const history = currentMessages.map((m) => ({ role: m.role, content: m.content }));

    await streamChat(
      text.trim(),
      history,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      () => {
        setStreaming(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Error: ${err}` } : m
          )
        );
        setStreaming(false);
      }
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatarBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerName: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.success },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingTop: 16 },
    emptyWrap: { flex: 1, paddingTop: 40 },
    emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "center", marginBottom: 8 },
    emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 24, lineHeight: 21 },
    suggestionsTitle: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 28, marginBottom: 12, textAlign: "center" },
    suggestion: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 8,
    },
    suggestionText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground },
    msgWrap: { marginBottom: 12, maxWidth: "85%" },
    msgWrapUser: { alignSelf: "flex-end" },
    msgWrapAssist: { alignSelf: "flex-start" },
    bubble: {
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    bubbleAssist: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
    bubbleTextUser: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.primaryForeground, lineHeight: 22 },
    bubbleTextAssist: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 },
    cursor: { opacity: 0.5 },
    inputWrap: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
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
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { backgroundColor: colors.border },
  });

  const renderMsg = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    return (
      <View style={[s.msgWrap, isUser ? s.msgWrapUser : s.msgWrapAssist]}>
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAssist]}>
          <Text style={isUser ? s.bubbleTextUser : s.bubbleTextAssist}>
            {item.content}
            {!isUser && streaming && item.content === "" ? "..." : ""}
          </Text>
        </View>
      </View>
    );
  };

  const canSend = input.trim().length > 0 && !streaming;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.avatarBox}>
            <Feather name="cpu" size={20} color={colors.primaryForeground} />
          </View>
          <View>
            <Text style={s.headerName}>Nutrition AI</Text>
            <Text style={s.headerSub}>Always available</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={s.container} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMsg}
          style={s.list}
          contentContainerStyle={[
            s.listContent,
            messages.length === 0 && { flexGrow: 1 },
          ]}
          inverted={messages.length > 0}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyTitle}>Ask me anything</Text>
              <Text style={s.emptySub}>
                I can help with nutrition advice, healthy recipes, meal planning, and more.
              </Text>
              <Text style={s.suggestionsTitle}>Try asking</Text>
              {SUGGESTIONS.map((s2) => (
                <TouchableOpacity key={s2} style={s.suggestion} onPress={() => send(s2)}>
                  <Text style={s.suggestionText}>{s2}</Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        />

        <View style={s.inputWrap}>
          <TextInput
            ref={inputRef}
            style={s.inputBox}
            placeholder="Ask about nutrition or recipes..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => send(input)}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
            onPress={() => {
              send(input);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            disabled={!canSend}
          >
            {streaming ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <Feather name="send" size={17} color={canSend ? colors.primaryForeground : colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
