// path: /home/jatin/Documents/RN/bep/components/VolatilityBar.tsx
import Colors from "@/constants/colors";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface VolatilityBarProps {
  volatility: number;
}

function getVolatilityLabel(v: number): string {
  if (v >= 75) return "Chaotic";
  if (v >= 50) return "Restless";
  if (v >= 25) return "Balanced";
  return "Calm";
}

export default function VolatilityBar({ volatility }: VolatilityBarProps) {
  // shared value lives on the UI thread
  const width = useSharedValue(volatility);

  useEffect(() => {
    // animate whenever prop changes
    width.value = withTiming(volatility, { duration: 700 });
  }, [volatility]);

  const label = getVolatilityLabel(volatility);
  const barColor =
    volatility >= 60
      ? Colors.volatility
      : volatility >= 30
      ? Colors.activityCoffee
      : Colors.energy;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
      backgroundColor: barColor,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>VOLATILITY</Text>
        <Text style={[styles.label, { color: barColor }]}>{label}</Text>
      </View>
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, animatedStyle]} />
        </View>
        <Text style={[styles.value, { color: barColor }]}>{volatility}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  trackContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  value: {
    fontSize: 14,
    fontWeight: "700" as const,
    width: 28,
    textAlign: "right",
  },
});
