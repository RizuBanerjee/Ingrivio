import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export default function AuthScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { signIn, signUp, forgotPassword, error, clearError } = useFirebaseAuth();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    clearError();
    if (!email.trim()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
        router.back();
      } else if (mode === "register") {
        await signUp(email.trim(), password, name.trim());
        router.back();
      } else {
        await forgotPassword(email.trim());
      }
    } catch {
      // Error shown from context
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerGrad: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 24,
      paddingHorizontal: 24, paddingBottom: 32,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
      marginBottom: 20,
    },
    title: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
    subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 4 },
    form: { padding: 24, gap: 16 },
    field: { gap: 6 },
    label: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    input: {
      backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    inputError: { borderColor: colors.error },
    passwordWrap: {
      backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      flexDirection: "row", alignItems: "center", paddingRight: 12,
    },
    passwordInput: {
      flex: 1, paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    submitBtn: {
      backgroundColor: colors.primary, borderRadius: 12,
      paddingVertical: 16, alignItems: "center", marginTop: 8,
    },
    submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground },
    errorText: {
      fontSize: 13, fontFamily: "Inter_500Medium", color: colors.error,
      textAlign: "center", marginTop: 4,
    },
    toggleRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 },
    toggleText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    toggleLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary },
    forgotLink: {
      fontSize: 13, fontFamily: "Inter_500Medium", color: colors.primary,
      textAlign: "center", marginTop: 4,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={theme.gradients.header as [string, string, ...string[]]}
          style={s.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={s.title}>
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Get Started" : "Reset Password"}
          </Text>
          <Text style={s.subtitle}>
            {mode === "login" ? "Sign in to continue your nutrition journey" : mode === "register" ? "Create your account and start tracking" : "Enter your email to receive a reset link"}
          </Text>
        </LinearGradient>

        <View style={s.form}>
          {mode === "register" && (
            <View style={s.field}>
              <Text style={s.label}>Full Name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={[s.input, error && s.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {mode !== "forgot" && (
            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <View style={[s.passwordWrap, error && s.inputError]}>
                <TextInput
                  style={s.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {error && <Text style={s.errorText}>{error}</Text>}

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={s.submitText}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
            </Text>
          </TouchableOpacity>

          {mode === "login" && (
            <TouchableOpacity onPress={() => { setMode("forgot"); clearError(); }}>
              <Text style={s.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <View style={s.toggleRow}>
            <Text style={s.toggleText}>
              {mode === "login" ? "No account?" : mode === "register" ? "Already have an account?" : "Remembered your password?"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode(mode === "login" ? "register" : "login");
                clearError();
              }}
            >
              <Text style={s.toggleLink}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}
