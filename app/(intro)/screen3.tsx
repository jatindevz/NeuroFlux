import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BarChart3, ClipboardList, Moon } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen3() {
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
    router.push("./screen4");
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
        <View style={styles.cycleContainer}>
          <View style={styles.cycleStep}>
            <View style={[styles.stepIcon, { borderColor: Colors.energy }]}>
              <ClipboardList size={20} color={Colors.energy} />
            </View>
            <Text style={styles.stepText}>LOG</Text>
          </View>
          <View style={styles.cycleLine} />
          <View style={styles.cycleStep}>
            <View style={[styles.stepIcon, { borderColor: Colors.nightPhase }]}>
              <Moon size={20} color={Colors.nightPhase} />
            </View>
            <Text style={styles.stepText}>END DAY</Text>
          </View>
          <View style={styles.cycleLine} />
          <View style={styles.cycleStep}>
            <View
              style={[styles.stepIcon, { borderColor: Colors.momentumUp }]}
            >
              <BarChart3 size={20} color={Colors.momentumUp} />
            </View>
            <Text style={styles.stepText}>ANALYZE</Text>
          </View>
        </View>

        <Text style={styles.headline}>THE LOOP</Text>
        <Text style={styles.body}>
          Log activities. Close the day. Analyze the trajectory.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
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
  cycleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  cycleStep: {
    alignItems: "center",
    gap: 8,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  cycleLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
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
