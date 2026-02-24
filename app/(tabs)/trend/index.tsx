// app/(tabs)/trend/index.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import BrainGraph from "@/components/BrainGraph";
import Colors from "@/constants/colors";
import useBrainStore from "@/store/brainStore";
import { computeStats, predictNextValue } from "@/constants/trendStats";

const { width: screenWidth } = Dimensions.get("window");
const RANGES = [7, 14, 30, 90] as const;
type Range = (typeof RANGES)[number];

export default function TrendScreen() {
  const insets = useSafeAreaInsets();
  const history = useBrainStore((s) => s.history);
  const currentEnergy = useBrainStore((s) => s.energy);

  const [range, setRange] = useState<Range>(7);

  // Check if enough data (more than 7 days)
  const hasEnoughData = history.length >= 7;

  // Slice history to selected range (most recent first)
  const slicedHistory = useMemo(
    () => history.slice(0, range).reverse(),
    [history, range],
  );

  // Prepare data for charts
  const chartData = useMemo(() => {
    const dates = slicedHistory.map((d) => d.date.slice(5)); // MM-DD
    const energy = slicedHistory.map((d) => d.energy);
    const volatility = slicedHistory.map((d) => d.volatility);
    const momentum = slicedHistory.map((d) => d.momentum);
    return { dates, energy, volatility, momentum };
  }, [slicedHistory]);

  // Compute statistics and predictions
  const stats = useMemo(() => computeStats(slicedHistory), [slicedHistory]);
  const nextEnergy = useMemo(
    () => predictNextValue(chartData.energy),
    [chartData.energy],
  );
  const nextVolatility = useMemo(
    () => predictNextValue(chartData.volatility),
    [chartData.volatility],
  );
  const nextMomentum = useMemo(
    () => predictNextValue(chartData.momentum),
    [chartData.momentum],
  );

  // Overall brain health score (weighted combination)
  const healthScore = useMemo(() => {
    if (slicedHistory.length === 0) return 0;
    const avgEnergy = stats.energy.avg;
    const avgVolatility = stats.volatility.avg;
    // Lower volatility is better, so invert it
    return Math.round(avgEnergy * 0.7 + (100 - avgVolatility) * 0.3);
  }, [stats]);

  const handleRangeChange = (r: Range) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRange(r);
  };

  // If not enough data, show placeholder
  if (!hasEnoughData) {
    return (
      <View
        style={[
          styles.placeholderContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <Text style={styles.placeholderEmoji}>📊</Text>
        <Text style={styles.placeholderTitle}>Not Enough Data</Text>
        <Text style={styles.placeholderText}>
          Log your activities for at least 7 days to see your neural trends,
          insights, and forecasts. Every entry brings you closer to
          understanding your brain's patterns.
        </Text>
        <View style={styles.placeholderHint}>
          <Text style={styles.placeholderHintText}>
            You have {history.length} day{history.length !== 1 ? "s" : ""} of
            data.
          </Text>
        </View>
      </View>
    );
  }

  // Main content when enough data
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Neural Trends</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>Brain Health</Text>
          <Text style={styles.scoreValue}>{healthScore}</Text>
        </View>
      </View>

      {/* Current Energy Card (refined) */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.energyCard}
      >
        <Text style={styles.energyLabel}>TOTAL ENERGY</Text>
        <Text style={styles.energyValue}>{currentEnergy}</Text>
        <View style={styles.energyFooter}>
          <Text style={styles.energySub}>
            {currentEnergy > 70
              ? "⚡ High performance"
              : currentEnergy > 40
                ? "🌱 Stable"
                : "🔄 Recharge needed"}
          </Text>
        </View>
      </LinearGradient>

      {/* Range Selector */}
      <View style={styles.rangeContainer}>
        {RANGES.map((r) => (
          <Pressable
            key={r}
            onPress={() => handleRangeChange(r)}
            style={[styles.rangeButton, range === r && styles.activeRange]}
          >
            <Text style={[styles.rangeText, range === r && styles.activeText]}>
              {r}D
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Energy Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⚡ Energy Flow</Text>
          <Text style={styles.cardStats}>
            avg {stats.energy.avg} | max {stats.energy.max}
          </Text>
        </View>
        <BrainGraph
          data={chartData.energy}
          color={Colors.energy}
          fillColor={`${Colors.energy}30`}
          showDots
          height={140}
          width={screenWidth - 72}
        />
      </View>

      {/* Volatility Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🌊 Volatility Waves</Text>
          <Text style={styles.cardStats}>
            avg {stats.volatility.avg} | max {stats.volatility.max}
          </Text>
        </View>
        <BrainGraph
          data={chartData.volatility}
          color={Colors.volatility}
          fillColor={`${Colors.volatility}30`}
          showDots
          height={140}
          width={screenWidth - 72}
        />
      </View>

      {/* Momentum Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🚀 Momentum Shift</Text>
          <Text style={styles.cardStats}>
            avg {stats.momentum.avg.toFixed(1)} | max{" "}
            {stats.momentum.max.toFixed(1)}
          </Text>
        </View>
        <BrainGraph
          data={chartData.momentum}
          color={Colors.momentumUp}
          fillColor={`${Colors.momentumUp}30`}
          showDots
          height={140}
          width={screenWidth - 72}
        />
      </View>

      {/* AI Insights Panel */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.insightsCard}
      >
        <Text style={styles.insightsTitle}>🧠 Brain Forecast</Text>
        <View style={styles.insightRow}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Tomorrow's Energy</Text>
            <Text style={[styles.insightValue, { color: Colors.energy }]}>
              {nextEnergy !== null ? Math.round(nextEnergy) : "—"}
            </Text>
            {nextEnergy !== null && (
              <Text style={styles.insightDelta}>
                {nextEnergy > currentEnergy ? "▲" : "▼"}{" "}
                {Math.abs(Math.round(nextEnergy - currentEnergy))}
              </Text>
            )}
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Volatility Trend</Text>
            <Text style={[styles.insightValue, { color: Colors.volatility }]}>
              {nextVolatility !== null ? Math.round(nextVolatility) : "—"}
            </Text>
            {nextVolatility !== null && stats.volatility.avg && (
              <Text style={styles.insightDelta}>
                {nextVolatility > stats.volatility.avg
                  ? "▲ rising"
                  : "▼ calming"}
              </Text>
            )}
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Momentum Direction</Text>
            <Text style={[styles.insightValue, { color: Colors.momentumUp }]}>
              {nextMomentum !== null ? nextMomentum.toFixed(1) : "—"}
            </Text>
            {nextMomentum !== null && (
              <Text style={styles.insightDelta}>
                {nextMomentum > 0 ? "positive" : "negative"}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.insightFooter}>
          Based on your last {range} days • {slicedHistory.length} records
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  scoreBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.energy,
  },
  energyCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 30,
    alignItems: "center",
  },
  energyLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  energyValue: {
    fontSize: 56,
    fontWeight: "200",
    color: Colors.energy,
    marginTop: 6,
  },
  energyFooter: {
    marginTop: 8,
  },
  energySub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rangeContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 10,
  },
  rangeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  activeRange: {
    backgroundColor: Colors.energy,
  },
  rangeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  activeText: {
    color: Colors.black,
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  cardStats: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  insightsCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  insightItem: {
    alignItems: "center",
  },
  insightLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: "300",
  },
  insightDelta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  insightFooter: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  // Placeholder styles
  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  placeholderHint: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderHintText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
