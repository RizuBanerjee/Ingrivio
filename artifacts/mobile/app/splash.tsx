import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { user, isAnonymous } = useFirebaseAuth();
  const [opacity] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Fade in + scale up
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      const isLoggedIn = !!user && !isAnonymous;
      router.replace(isLoggedIn ? "/(tabs)" : "/auth");
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, isAnonymous, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require("@/assets/splash-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: width * 0.7,
    height: height * 0.4,
  },
});
