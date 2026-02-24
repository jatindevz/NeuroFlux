import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { TrendingUp } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen4() {
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
    router.push("./screen5");
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
        <View style={styles.graphContainer}>
          <View style={styles.graph}>
            <View style={styles.graphLine} />
            <View style={styles.graphDot1} />
            <View style={styles.graphDot2} />
            <View style={styles.graphDot3} />
            <View style={styles.graphDot4} />
            <View style={styles.graphDot5} />
          </View>
          <View style={styles.graphIcon}>
            <TrendingUp size={32} color={Colors.momentumUp} />
          </View>
        </View>

        <Text style={styles.headline}>COMPOUND VELOCITY</Text>
        <Text style={styles.body}>
          Small behaviors compound over time. Momentum reveals your true
          direction.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
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
  graphContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  graph: {
    width: 200,
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  graphLine: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: Colors.border,
  },
  graphDot1: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.momentumUp,
  },
  graphDot2: {
    position: "absolute",
    bottom: 36,
    left: 56,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.momentumUp,
  },
  graphDot3: {
    position: "absolute",
    bottom: 48,
    left: 88,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.momentumUp,
  },
  graphDot4: {
    position: "absolute",
    bottom: 60,
    left: 120,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.momentumUp,
  },
  graphDot5: {
    position: "absolute",
    bottom: 72,
    left: 152,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.momentumUp,
  },
  graphIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.momentumUp + "15",
    alignItems: "center",
    justifyContent: "center",
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
