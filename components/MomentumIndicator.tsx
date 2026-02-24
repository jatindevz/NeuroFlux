// path: /home/jatin/Documents/RN/bep/components/MomentumIndicator.tsx
import Colors from "@/constants/colors";
import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MomentumIndicatorProps {
  momentum: number;
}

export default function MomentumIndicator({
  momentum,
}: MomentumIndicatorProps) {
  const isPositive = momentum > 0.5;
  const isNegative = momentum < -0.5;
  const color = isPositive
    ? Colors.momentumUp
    : isNegative
      ? Colors.momentumDown
      : Colors.momentumNeutral;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const label = isPositive ? "Rising" : isNegative ? "Falling" : "Stable";
  const sign = momentum > 0 ? "+" : "";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>MOMENTUM</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + "18" }]}>
          <Icon size={16} color={color} />
        </View>
        <Text style={[styles.value, { color }]}>
          {sign}
          {momentum.toFixed(1)}
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: 10 }, (_, i) => {
            const dotActive =
              momentum > 0
                ? i < Math.ceil(momentum)
                : i < Math.ceil(Math.abs(momentum));
            return (
              <View
                key={i}
                style={[styles.dot, dotActive && { backgroundColor: color }]}
              />
            );
          })}
        </View>
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
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 16,
    fontWeight: "700" as const,
    width: 42,
  },
  dots: {
    flex: 1,
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
});
