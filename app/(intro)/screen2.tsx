import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Activity, TrendingUp, Zap } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleNext = useCallback(() => {
    router.push("./screen3");
  }, [router]);

  const handleSkip = useCallback(async () => {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    router.replace("/(tabs)/(home)");
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { borderColor: Colors.energy }]}>
            <Zap size={24} color={Colors.energy} />
            <Text style={[styles.metricLabel, { color: Colors.energy }]}>
              ENERGY
            </Text>
          </View>
          <View
            style={[styles.metricCard, { borderColor: Colors.volatility }]}
          >
            <Activity size={24} color={Colors.volatility} />
            <Text style={[styles.metricLabel, { color: Colors.volatility }]}>
              VOLATILITY
            </Text>
          </View>
          <View
            style={[styles.metricCard, { borderColor: Colors.momentumUp }]}
          >
            <TrendingUp size={24} color={Colors.momentumUp} />
            <Text style={[styles.metricLabel, { color: Colors.momentumUp }]}>
              MOMENTUM
            </Text>
          </View>
        </View>

        <Text style={styles.headline}>INPUT DETERMINES STATE</Text>
        <Text style={styles.body}>
          Every action alters Energy, Volatility, and Momentum. Quantify the
          impact.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            style={styles.button}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>NEXT</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  metricCard: {
    width: 80,
    height: 90,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  footer: {
    paddingBottom: 40 + 24,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.energy,
  },
  button: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.energy,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 160,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.energy,
    letterSpacing: 1,
  },
});
