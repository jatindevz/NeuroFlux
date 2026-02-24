// path: /home/jatin/Documents/RN/bep/components/EnergyMeter.tsx
import Colors from "@/constants/colors";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

interface EnergyMeterProps {
  energy: number;
  phase: "DAY" | "NIGHT";
}

const RADIUS = 90;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;

function getEnergyLabel(energy: number): string {
  if (energy >= 85) return "Peak Flow";
  if (energy >= 65) return "Focused";
  if (energy >= 45) return "Steady";
  if (energy >= 25) return "Drained";
  return "Depleted";
}

function getEnergyColor(energy: number): string {
  if (energy >= 65) return Colors.energy;
  if (energy >= 35) return Colors.activityCoffee;
  return Colors.activityScroll;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function EnergyMeter({ energy, phase }: EnergyMeterProps) {
  // shared values on the UI thread
  const energyVal = useSharedValue(energy);
  const scale = useSharedValue(1);

  // local state for rendering rounded energy value
  const [displayEnergy, setDisplayEnergy] = useState<number>(energy);

  // update shared values when prop changes
  useEffect(() => {
    energyVal.value = withTiming(energy, { duration: 900 });

    scale.value = withSequence(
      withTiming(1.03, { duration: 150 }),
      withTiming(1, { duration: 300 }),
    );
  }, [energy]);

  // keep displayEnergy in sync with the animated shared value
  useAnimatedReaction(
    () => {
      return Math.round(energyVal.value);
    },
    (rounded, previous) => {
      if (rounded !== previous) {
        runOnJS(setDisplayEnergy)(rounded);
      }
    },
    [energyVal],
  );

  const progress = displayEnergy / 100;

  const circleProps = useAnimatedProps(() => {
    const offset = CIRCUMFERENCE * (1 - energyVal.value / 100);
    return {
      strokeDashoffset: offset,
    };
  });

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const color = getEnergyColor(displayEnergy);
  const label = getEnergyLabel(displayEnergy);

  return (
    <Animated.View style={[styles.container, scaleStyle]}>
      <View style={[styles.glowRing, { shadowColor: color }]}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            animatedProps={circleProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={[styles.energyNumber, { color }]}>{displayEnergy}</Text>
          <Text style={styles.energyLabel}>{label}</Text>
          <Text style={styles.energySublabel}>
            {phase === "NIGHT" ? "FROZEN" : "BRAIN ENERGY"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  glowRing: {
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  energyNumber: {
    fontSize: 52,
    fontWeight: "200" as const,
    letterSpacing: -2,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  energySublabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 2,
  },
});
