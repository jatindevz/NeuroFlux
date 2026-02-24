// path: /home/jatin/Documents/RN/bep/components/HistoryCard.tsx
import { ACTIVITIES } from "@/constants/activities";
import Colors from "@/constants/colors";
import { DailyLog } from "@/types/brain";
import {
    Activity,
    Minus,
    TrendingDown,
    TrendingUp,
    Zap,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface HistoryCardProps {
  log: DailyLog;
}

function getEnergyColor(energy: number): string {
  if (energy >= 65) return Colors.energy;
  if (energy >= 35) return Colors.activityCoffee;
  return Colors.activityScroll;
}

export default function HistoryCard({ log }: HistoryCardProps) {
  const date = new Date(log.date + "T12:00:00");
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const energyColor = getEnergyColor(log.energy);
  const isPositiveMomentum = log.momentum > 0.5;
  const isNegativeMomentum = log.momentum < -0.5;
  const momentumColor = isPositiveMomentum
    ? Colors.momentumUp
    : isNegativeMomentum
      ? Colors.momentumDown
      : Colors.momentumNeutral;
  const MomentumIcon = isPositiveMomentum
    ? TrendingUp
    : isNegativeMomentum
      ? TrendingDown
      : Minus;

  const activityNames = log.activities
    .map((a) => ACTIVITIES.find((act) => act.id === a.activityId)?.label)
    .filter(Boolean);
  const uniqueActivities = [...new Set(activityNames)];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.dateText}>{dateLabel}</Text>
        <View style={styles.activityCountBadge}>
          <Text style={styles.activityCountText}>{log.activities.length}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Zap size={14} color={energyColor} />
          <Text style={[styles.metricValue, { color: energyColor }]}>
            {log.energy}
          </Text>
          <Text style={styles.metricLabel}>Energy</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Activity size={14} color={Colors.volatility} />
          <Text style={[styles.metricValue, { color: Colors.volatility }]}>
            {log.volatility}
          </Text>
          <Text style={styles.metricLabel}>Volatility</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <MomentumIcon size={14} color={momentumColor} />
          <Text style={[styles.metricValue, { color: momentumColor }]}>
            {log.momentum > 0 ? "+" : ""}
            {log.momentum.toFixed(1)}
          </Text>
          <Text style={styles.metricLabel}>Momentum</Text>
        </View>
      </View>

      {uniqueActivities.length > 0 && (
        <View style={styles.activitiesRow}>
          {uniqueActivities.slice(0, 4).map((name, i) => (
            <View key={i} style={styles.activityTag}>
              <Text style={styles.activityTagText}>{name}</Text>
            </View>
          ))}
          {uniqueActivities.length > 4 && (
            <Text style={styles.moreText}>+{uniqueActivities.length - 4}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  activityCountBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityCountText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  activitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  activityTag: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityTagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  moreText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
