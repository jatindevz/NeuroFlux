import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Easing,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Task, useReset21Store } from "@/store/reset21Store";

// ✅ LOCAL COLORS - Reset21 has its own theme (charcoal-based)
const Colors = {
  charcoal: "#121212",
  card: "#1E1E1E",
  cardHover: "#2A2A2A",
  accent: "#6366f1",
  accentHover: "#4f46e5",
  success: "#10b981",
  textMain: "#E5E5E5",
  textMuted: "#A3A3A3",
  border: "#333",
  red: "#ef4444",
  orange: "#f97316",
  blue: "#3b82f6",
  emerald: "#10b981",
};

export default function Reset21Screen() {
  const insets = useSafeAreaInsets();
  const store = useReset21Store();
  const {
    started,
    day,
    points,
    streak,
    mode,
    currentDayTasks,
    completedTasks,
  } = store;

  // ✅ UI State (No countdown timers)
  const [selectedMode, setSelectedMode] = useState<
    "foundation" | "build" | null
  >(null);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [urgeModalVisible, setUrgeModalVisible] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [delayActive, setDelayActive] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(600);
  const delayRef = useRef<NodeJS.Timeout | null>(null);

  const breathAnim = useRef(new Animated.Value(1)).current;

  // ✅ Check 4 AM Rollover on Mount & AppState Change
  useEffect(() => {
    store.checkDayRollover();
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        store.checkDayRollover();
      }
    });
    return () => subscription.remove();
  }, [store]);

  // Breathing animation
  useEffect(() => {
    if (breathingActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, {
            toValue: 1.5,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      breathAnim.setValue(1);
    }
  }, [breathingActive]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (delayRef.current) clearInterval(delayRef.current);
    };
  }, []);

  const handleModeSelect = (mode: "foundation" | "build") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMode(mode);
  };

  const handleStartChallenge = () => {
    if (!selectedMode) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.startChallenge(selectedMode);
  };

  const handleCompleteTask = (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    store.completeTask(taskId);
  };

  // ✅ REMOVED: handleFinishDay (No manual finish button)

  // ✅ Handle Restart Challenge
  const handleRestartChallenge = () => {
    Alert.alert(
      "Start New Cycle?",
      "This will reset your progress to Day 1. You can choose a new difficulty mode.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            store.reset();
          },
        },
      ],
    );
  };

  const startTaskTimer = (task: Task) => {
    setActiveTask(task);
    setTimeLeft(task.duration!);
    setTimerModalVisible(true);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = interval;
  };

  const completeActiveTask = () => {
    if (activeTask) {
      handleCompleteTask(activeTask.id);
      closeTimerModal();
    }
  };

  const closeTimerModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerModalVisible(false);
    setActiveTask(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Urge protocol
  const startBreathing = () => setBreathingActive(true);
  const stopBreathing = () => setBreathingActive(false);

  const startDelay = () => {
    setDelayActive(true);
    setDelaySeconds(600);
    const interval = setInterval(() => {
      setDelaySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          delayRef.current = null;
          Alert.alert("10 minutes passed", "The urge should be manageable now.");
          stopDelay();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    delayRef.current = interval;
  };

  const stopDelay = () => {
    if (delayRef.current) clearInterval(delayRef.current);
    delayRef.current = null;
    setDelayActive(false);
  };

  const closeUrgeModal = () => {
    setUrgeModalVisible(false);
    stopBreathing();
    stopDelay();
  };

  // Render task card
  const renderTaskCard = (task: Task) => {
    const isCompleted = completedTasks.includes(task.id);
    const isTimed = task.type === "timed";

    return (
      <View
        key={task.id}
        style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
      >
        <View style={styles.taskHeader}>
          <View>
            <Text style={styles.taskCategory}>{task.category}</Text>
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+{task.points}</Text>
          </View>
        </View>
        <Text style={styles.taskDesc}>{task.desc}</Text>
        <TouchableOpacity
          style={[
            styles.taskButton,
            isCompleted ? styles.taskButtonCompleted : styles.taskButtonActive,
          ]}
          onPress={() => {
            if (isCompleted) return;
            if (isTimed) {
              startTaskTimer(task);
            } else {
              handleCompleteTask(task.id);
            }
          }}
          disabled={isCompleted}
        >
          <Text style={styles.taskButtonText}>
            {isCompleted ? "Completed" : isTimed ? "Start Timer" : "Complete"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ✅ Check if Required Task is Done (for UI Banner)
  const requiredTaskDone = 
    currentDayTasks.required && 
    completedTasks.includes(currentDayTasks.required.id);

  // Onboarding view
  if (!started) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.onboarding}>
            <View style={styles.logoContainer}>
              <Feather name="zap" size={40} color={Colors.accent} />
            </View>
            <Text style={styles.title}>21 Day Reset</Text>
            <Text style={styles.subtitle}>
              Replace compulsive habits with mindful action. One day at a time.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DIFFICULTY MODE</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    selectedMode === "foundation" && styles.modeCardActive,
                  ]}
                  onPress={() => handleModeSelect("foundation")}
                >
                  <Text
                    style={[
                      styles.modeTitle,
                      selectedMode === "foundation" && styles.modeTitleActive,
                    ]}
                  >
                    Foundation
                  </Text>
                  <Text style={styles.modeDesc}>Lighter tasks to start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    selectedMode === "build" && styles.modeCardActive,
                  ]}
                  onPress={() => handleModeSelect("build")}
                >
                  <Text
                    style={[
                      styles.modeTitle,
                      selectedMode === "build" && styles.modeTitleActive,
                    ]}
                  >
                    Build
                  </Text>
                  <Text style={styles.modeDesc}>Intense discipline</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>REMINDER TIME</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {reminderTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Feather name="clock" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={reminderTime}
                  mode="time"
                  is24Hour={false}
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setReminderTime(date);
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                !selectedMode && styles.startButtonDisabled,
              ]}
              onPress={handleStartChallenge}
              disabled={!selectedMode}
            >
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Completion view
  if (day > 21) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.completion}>
            <LinearGradient
              colors={[Colors.accent, "#8b5cf6"]}
              style={styles.completionIcon}
            >
              <Feather name="star" size={48} color="white" />
            </LinearGradient>
            <Text style={styles.completionTitle}>Challenge Complete</Text>
            <Text style={styles.completionSubtitle}>
              You've successfully rewired your habits. The journey continues, but
              you've built the foundation.
            </Text>
            <View style={styles.completionStats}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{points}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>

            {/* ✅ Restart Button */}
            <TouchableOpacity
              style={styles.restartButton}
              onPress={handleRestartChallenge}
            >
              <Text style={styles.restartButtonText}>Start New Cycle</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Dashboard view
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dayText}>Day {day}/21</Text>
            <Text style={styles.daySubtext}>
              {requiredTaskDone ? "Complete ✅" : "Keep the momentum"}
            </Text>
          </View>
          <View style={styles.pointsHeader}>
            <Text style={styles.pointsHeaderValue}>{points}</Text>
            <Text style={styles.pointsHeaderLabel}>Points</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressFill,
              {
                width: requiredTaskDone ? "100%" : "0%",
              },
            ]}
          />
        </View>

        {/* ✅ Day Complete Banner (Shows if Required Done, but before 4 AM) */}
        {requiredTaskDone && (
          <View style={styles.completeBanner}>
            <Feather name="check-circle" size={20} color={Colors.success} />
            <Text style={styles.completeBannerText}>
              Day {day} Complete! Optional tasks still available until 4 AM.
            </Text>
          </View>
        )}

        {/* Streak Card */}
        <LinearGradient
          colors={[Colors.card, Colors.charcoal]}
          style={styles.streakCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.streakLeft}>
            <View style={styles.streakIcon}>
              <Feather name="trending-up" size={24} color={Colors.orange} />
            </View>
            <View>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakSub}>Days completed consecutively</Text>
            </View>
          </View>
          <Text style={styles.streakValue}>{streak}</Text>
        </LinearGradient>

        {/* Tasks */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          {currentDayTasks.required && renderTaskCard(currentDayTasks.required)}

          <Text style={styles.optionalTitle}>Optional Boosters</Text>
          {currentDayTasks.optional.map((task) => renderTaskCard(task))}
        </View>
      </ScrollView>

      {/* Urge Protocol FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setUrgeModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="alert-triangle" size={24} color={Colors.red} />
      </TouchableOpacity>

      {/* Urge Protocol Modal */}
      <Modal
        visible={urgeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeUrgeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Urge Protocol</Text>
              <TouchableOpacity onPress={closeUrgeModal}>
                <Feather name="x" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!breathingActive && !delayActive && (
              <View style={styles.urgeOptions}>
                <TouchableOpacity
                  style={styles.urgeOption}
                  onPress={startBreathing}
                >
                  <View
                    style={[
                      styles.urgeIcon,
                      { backgroundColor: Colors.blue + "20" },
                    ]}
                  >
                    <Feather name="wind" size={24} color={Colors.blue} />
                  </View>
                  <View style={styles.urgeText}>
                    <Text style={styles.urgeTitle}>Box Breathing</Text>
                    <Text style={styles.urgeDesc}>
                      2 minutes to reset nervous system
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.urgeOption}
                  onPress={() => {
                    Alert.alert(
                      "Get on the floor",
                      "Do 10 pushups. Right now.",
                    );
                    closeUrgeModal();
                  }}
                >
                  <View
                    style={[
                      styles.urgeIcon,
                      { backgroundColor: Colors.orange + "20" },
                    ]}
                  >
                    <Feather name="activity" size={24} color={Colors.orange} />
                  </View>
                  <View style={styles.urgeText}>
                    <Text style={styles.urgeTitle}>Physical Reset</Text>
                    <Text style={styles.urgeDesc}>10 Pushups immediately</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.urgeOption}
                  onPress={startDelay}
                >
                  <View
                    style={[
                      styles.urgeIcon,
                      { backgroundColor: Colors.emerald + "20" },
                    ]}
                  >
                    <Feather name="clock" size={24} color={Colors.emerald} />
                  </View>
                  <View style={styles.urgeText}>
                    <Text style={styles.urgeTitle}>10-Minute Delay</Text>
                    <Text style={styles.urgeDesc}>
                      Wait 10 mins before acting
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {breathingActive && (
              <View style={styles.breathingContainer}>
                <Animated.View
                  style={[
                    styles.breathCircle,
                    {
                      transform: [{ scale: breathAnim }],
                      opacity: breathAnim.interpolate({
                        inputRange: [1, 1.5],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ]}
                >
                  <View style={styles.breathInner} />
                </Animated.View>
                <Text style={styles.breathText}>Breathe</Text>
                <Text style={styles.breathSub}>
                  Inhale... Hold... Exhale...
                </Text>
                <TouchableOpacity onPress={stopBreathing}>
                  <Text style={styles.breathStop}>Stop</Text>
                </TouchableOpacity>
              </View>
            )}

            {delayActive && (
              <View style={styles.delayContainer}>
                <Text style={styles.delayTimer}>
                  {formatTime(delaySeconds)}
                </Text>
                <Text style={styles.delaySub}>The urge will pass.</Text>
                <TouchableOpacity onPress={stopDelay}>
                  <Text style={styles.delayStop}>Give Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Task Timer Modal */}
      <Modal
        visible={timerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTimerModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.timerTaskTitle}>{activeTask?.title}</Text>
            <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
            <View style={styles.timerProgressContainer}>
              <View
                style={[
                  styles.timerProgress,
                  {
                    width: `${(timeLeft / (activeTask?.duration || 1)) * 100}%`,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.timerCompleteButton}
              onPress={completeActiveTask}
            >
              <Text style={styles.timerCompleteText}>Complete Task</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeTimerModal}>
              <Text style={styles.timerCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.charcoal,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Onboarding
  onboarding: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  section: {
    width: "100%",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.cardHover,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textMain,
    marginBottom: 4,
  },
  modeTitleActive: {
    color: Colors.accent,
  },
  modeDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    fontSize: 16,
    color: Colors.textMain,
  },
  startButton: {
    width: "100%",
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: Colors.border,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Dashboard
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textMain,
  },
  daySubtext: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  pointsHeader: {
    alignItems: "flex-end",
  },
  pointsHeaderValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
  },
  pointsHeaderLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  progressContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  // ✅ Day Complete Banner
  completeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.success + "10",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.success + "30",
  },
  completeBannerText: {
    fontSize: 13,
    color: Colors.success,
    flex: 1,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.orange + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textMain,
  },
  streakSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textMain,
  },
  tasksSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  optionalTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },
  taskCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  taskCardCompleted: {
    opacity: 0.7,
    borderColor: Colors.success,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskCategory: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.accent,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textMain,
  },
  pointsBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  taskDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  taskButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  taskButtonActive: {
    backgroundColor: Colors.accent,
  },
  taskButtonCompleted: {
    backgroundColor: Colors.success + "20",
  },
  taskButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  // Restart Button
  restartButton: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  restartButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.red + "20",
    borderWidth: 1,
    borderColor: Colors.red + "50",
    alignItems: "center",
    justifyContent: "center",
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textMain,
  },
  urgeOptions: {
    padding: 16,
    gap: 12,
  },
  urgeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.cardHover,
    padding: 16,
    borderRadius: 16,
  },
  urgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  urgeText: {
    flex: 1,
  },
  urgeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textMain,
  },
  urgeDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  breathingContainer: {
    alignItems: "center",
    padding: 40,
  },
  breathCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.blue + "30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  breathInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.blue + "50",
  },
  breathText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textMain,
  },
  breathSub: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  breathStop: {
    marginTop: 24,
    color: Colors.textMuted,
    textDecorationLine: "underline",
  },
  delayContainer: {
    alignItems: "center",
    padding: 40,
  },
  delayTimer: {
    fontSize: 48,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: Colors.emerald,
    marginBottom: 8,
  },
  delaySub: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  delayStop: {
    marginTop: 24,
    color: Colors.textMuted,
    textDecorationLine: "underline",
  },
  // Timer modal
  timerTaskTitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  timerDisplay: {
    fontSize: 56,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: Colors.textMain,
    textAlign: "center",
    marginVertical: 20,
  },
  timerProgressContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginHorizontal: 20,
    marginBottom: 30,
    overflow: "hidden",
  },
  timerProgress: {
    height: "100%",
    backgroundColor: Colors.accent,
  },
  timerCompleteButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
  },
  timerCompleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  timerCancel: {
    textAlign: "center",
    color: Colors.textMuted,
    marginBottom: 20,
  },
  // Completion
  completion: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  completionIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textMain,
    textAlign: "center",
    marginBottom: 12,
  },
  completionSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 300,
  },
  completionStats: {
    flexDirection: "row",
    gap: 20,
  },
  statCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});