// path: /home/jatin/Documents/RN/bep/components/ActivityGrid.tsx
import { ACTIVITIES } from "@/constants/activities";
import Colors from "@/constants/colors";
import { Activity } from "@/types/brain";
import * as Haptics from "expo-haptics";
import {
  BookOpen,
  Coffee,
  Footprints,
  Gamepad2,
  Moon,
  Pizza,
  Smartphone,
  Wind,
} from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size: number; color: string }>
> = {
  Smartphone,
  BookOpen,
  Footprints,
  Wind,
  Coffee,
  Moon,
  Pizza,
  Gamepad2,
};

interface ActivityGridProps {
  onLog: (activity: Activity) => void;
  disabled?: boolean;
}

function ActivityCard({
  activity,
  onPress,
  disabled,
}: {
  activity: Activity;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const IconComponent = ICON_MAP[activity.icon];

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: 100,
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

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [disabled, onPress]);

  const isPositive = activity.energyDelta > 0;
  const deltaText = isPositive
    ? `+${activity.energyDelta}`
    : `${activity.energyDelta}`;

  return (
    <Animated.View
      style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <Pressable
        style={[styles.card, disabled && styles.cardDisabled]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        testID={`activity-${activity.id}`}
      >
        <View
          style={[styles.iconBg, { backgroundColor: activity.color + "15" }]}
        >
          {IconComponent && <IconComponent size={20} color={activity.color} />}
        </View>
        <Text style={styles.cardLabel} numberOfLines={1}>
          {activity.label}
        </Text>
        <Text
          style={[
            styles.delta,
            { color: isPositive ? Colors.momentumUp : Colors.momentumDown },
          ]}
        >
          {deltaText} E
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ActivityGrid({ onLog, disabled }: ActivityGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>LOG ACTIVITY</Text>
      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => onLog(activity)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardWrapper: {
    // percentages are valid values for width/flexBasis/maxWidth in React Native
    width: "23%",
    flexGrow: 1,
    flexBasis: "22%",
    maxWidth: "25%",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  delta: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
});
