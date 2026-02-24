// path: /home/jatin/Documents/RN/bep/components/PhaseHeader.tsx
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { ChevronRight, Moon, Sun } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface PhaseHeaderProps {
  phase: "DAY" | "NIGHT";
  activityCount: number;
  onEndDay: () => void;
  onResetDay: () => void;
  resetEnabled?: boolean; // new prop
}

export default function PhaseHeader({
  phase,
  activityCount,
  onEndDay,
  onResetDay,
  resetEnabled = false,
}: PhaseHeaderProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDay = phase === "DAY";
  const phaseColor = isDay ? Colors.dayPhase : Colors.nightPhase;

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePhaseAction = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (isDay) {
      onEndDay();
    } else {
      // if reset not allowed, ignore the click
      if (!resetEnabled) return;
      onResetDay();
    }
  }, [isDay, onEndDay, onResetDay, resetEnabled]);

  const actionDisabled = !isDay && !resetEnabled;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View
          style={[styles.phaseBadge, { backgroundColor: phaseColor + "20" }]}
        >
          {isDay ? (
            <Sun size={14} color={phaseColor} />
          ) : (
            <Moon size={14} color={phaseColor} />
          )}
          <Text style={[styles.phaseText, { color: phaseColor }]}>
            {isDay ? "DAY" : "NIGHT"}
          </Text>
        </View>
        <View>
          <Text style={styles.dateText}>{dateString}</Text>
          <Text style={styles.countText}>
            {activityCount} {activityCount === 1 ? "activity" : "activities"}{" "}
            logged
          </Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={[
            styles.actionButton,
            { borderColor: phaseColor + "40" },
            actionDisabled && styles.actionButtonDisabled,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePhaseAction}
          disabled={actionDisabled}
          testID="phase-action-button"
        >
          <Text style={[styles.actionText, { color: phaseColor }]}>
            {isDay ? "End Day" : "New Day"}
          </Text>
          <ChevronRight size={14} color={phaseColor} />
        </Pressable>

        {/* small hint when New Day is disabled */}
        {!isDay && !resetEnabled && (
          <Text style={styles.hintText}>Available after 4:00 AM</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseText: {
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 1.5,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
  },
  countText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  hintText: {
    marginTop: 6,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
