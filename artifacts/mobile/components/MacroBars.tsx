import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
}

function MacroBar({ label, value, goal, color, unit = "g" }: MacroBarProps) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = goal > 0 ? Math.min(value / goal, 1) : 0;
    progress.value = withTiming(target, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [value, goal]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    value: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    track: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
    fill: { height: 6, borderRadius: 3, backgroundColor: color },
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            /{goal}{unit}
          </Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
    </View>
  );
}

interface Props {
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fats: number;
  fatsGoal: number;
}

export function MacroBars({ protein, proteinGoal, carbs, carbsGoal, fats, fatsGoal }: Props) {
  const colors = useColors();
  return (
    <View>
      <MacroBar label="Protein" value={protein} goal={proteinGoal} color={colors.protein} />
      <MacroBar label="Carbs" value={carbs} goal={carbsGoal} color={colors.carbs} />
      <MacroBar label="Fats" value={fats} goal={fatsGoal} color={colors.fats} />
    </View>
  );
}
