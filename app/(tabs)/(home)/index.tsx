// path: /home/jatin/Documents/RN/bep/app/(tabs)/(home)/index.tsx
import ActivityGrid from "@/components/ActivityGrid";
import EnergyMeter from "@/components/EnergyMeter";
import PhaseHeader from "@/components/PhaseHeader";
import Colors from "@/constants/colors";
import useBrainStore from "@/store/brainStore";
import { Activity } from "@/types/brain";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getVolatilityLabel(v: number) {
  if (v >= 70) return "Chaotic";
  if (v >= 40) return "Restless";
  if (v >= 20) return "Balanced";
  return "Calm";
}

function getMomentumLabel(m: number) {
  if (m > 1) return "Rising";
  if (m < -1) return "Falling";
  return "Stable";
}

// helper: compute allowed reset DateTime (lastReset + 1 day at 04:00 local)
function getAllowedResetTime(lastResetDateStr: string) {
  // lastResetDateStr format is expected YYYY-MM-DD (from getToday)
  const allowed = new Date(`${lastResetDateStr}T04:00:00`);
  allowed.setDate(allowed.getDate() + 1);
  return allowed;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const energy = useBrainStore((s) => s.energy);
  const volatility = useBrainStore((s) => s.volatility);
  const momentum = useBrainStore((s) => s.momentum);
  const phase = useBrainStore((s) => s.phase);
  const todayActivities = useBrainStore((s) => s.todayActivities);

  const lastReset = useBrainStore((s) => s.lastReset);

  const logActivity = useBrainStore((s) => s.logActivity);
  const endDay = useBrainStore((s) => s.endDay);
  const resetDay = useBrainStore((s) => s.resetDay);

  const checkAndResetDay = useBrainStore((s) => s.checkAndResetDay);

  // Same volatility logic, just hidden math
  const VOLATILITY_IMPACT = 0.3;
  const effectiveEnergy = Math.max(
    0,
    Math.round(energy - volatility * VOLATILITY_IMPACT),
  );

  // keep a clock ticking so we immediately notice system time/date jumps
  const [now, setNow] = useState<Date>(() => new Date());
  const lastNowRef = useRef<Date>(now);

  // whether New Day button is currently active; once enabled we keep it
  // until the user actually resets the day (or lastReset changes).
  const [resetEnabled, setResetEnabled] = useState<boolean>(() => {
    try {
      return new Date() >= getAllowedResetTime(lastReset);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const id = setInterval(() => {
      setNow((prev) => {
        const next = new Date();
        lastNowRef.current = prev;
        return next;
      });
    }, 1000); // every second
    return () => clearInterval(id);
  }, []);

  // recalculation effect: compute condition but only flip from false to true
  // to avoid disabling when clock jumps backward. also reset when day rolls.
  useEffect(() => {
    try {
      const allowed = getAllowedResetTime(lastReset);
      const todayStr = now.toISOString().split("T")[0];
      const crossedDay = todayStr !== lastReset;
      const manualJump =
        now.getTime() - lastNowRef.current.getTime() > 5 * 60 * 1000; // >5m
      const cond = now >= allowed || (crossedDay && manualJump);
      console.log("[Dashboard] resetEnabled check", {
        now,
        lastReset,
        allowed,
        crossedDay,
        manualJump,
        cond,
        prev: resetEnabled,
      });
      if (cond && !resetEnabled) {
        setResetEnabled(true);
      }
      // if lastReset changed (user pressed New Day) turn back off
      if (todayStr === lastReset && resetEnabled && !cond) {
        setResetEnabled(false);
      }
    } catch (e) {
      console.warn("[Dashboard] resetEnabled calc failed", e);
    }
  }, [now, lastReset]);


  useEffect(() => {
    checkAndResetDay();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogActivity = useCallback(
    (activity: Activity) => {
      logActivity(activity);
    },
    [logActivity],
  );

  const handleEndDay = useCallback(() => {
    endDay();
  }, [endDay]);

  const handleResetDay = useCallback(() => {
    if (!resetEnabled) {
      console.log(
        "[Dashboard] Reset attempted before allowed time (4AM). Ignored.",
      );
      return;
    }
    resetDay();
    setResetEnabled(false); // clear flag until next threshold/detect
  }, [resetDay, resetEnabled]);

  const isNight = phase === "NIGHT";

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          <PhaseHeader
            phase={phase}
            activityCount={todayActivities.length}
            onEndDay={handleEndDay}
            onResetDay={handleResetDay}
            resetEnabled={resetEnabled} // <-- NEW prop
          />

          {/*
           * AUTOMATIC‑RESET UI VARIANT (commented out for future reference)
           *
           * If the store were allowed to reset the session automatically when the
           * clock passes 4 AM (see the commented block in brainStore.checkAndResetDay),
           * the manual "New Day" button would be redundant. One way to reflect that
           * in the UI is to replace PhaseHeader with a simple message:
           *
           *   <Text style={styles.autoResetNotice}>Day rolled over</Text>
           *
           * or omit <PhaseHeader> entirely and call handleResetDay() inside a
           * useEffect when resetEnabled becomes true. The code below shows the gist:
           *
           *   useEffect(() => {
           *     if (!isNight && resetEnabled) {
           *       // auto‑advance without user interaction
           *       resetDay();
           *     }
           *   }, [isNight, resetEnabled]);
           *
           * Leave this block commented; it can be restored later if automatic
           * rollover behaviour is desired again.
           */}

          {/* HERO ENERGY */}
          <EnergyMeter energy={effectiveEnergy} phase={phase} />

          {/* SIMPLE STATUS STRIP */}
          <View style={styles.statusStrip}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Mind</Text>
              <Text style={styles.statusValue}>
                {getVolatilityLabel(volatility)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Trend</Text>
              <Text style={styles.statusValue}>
                {getMomentumLabel(momentum)}
              </Text>
            </View>
          </View>

          {isNight ? (
            <View style={styles.nightOverlay}>
              <Text style={styles.nightTitle}>Day Frozen</Text>
              <Text style={styles.nightText}>
                Your brain state has been captured. Tap "New Day" after 4 AM to
                see how tonight's rest affects tomorrow's energy.
              </Text>
            </View>
          ) : (
            <ActivityGrid onLog={handleLogActivity} disabled={isNight} />
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/* --- keep your existing styles below --- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },

  statusStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 24,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  statusItem: {
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1,
  },

  statusValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },

  nightOverlay: {
    marginHorizontal: 24,
    marginTop: 20,
    padding: 20,
    backgroundColor: Colors.nightPhase + "15",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.nightPhase + "40",
    alignItems: "center",
  },

  nightTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.nightPhase,
  },

  nightText: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
