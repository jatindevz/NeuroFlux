import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Task {
  id: string;
  title: string;
  category: string;
  desc: string;
  points: number;
  type: "action" | "timed";
  duration?: number;
  isRequired?: boolean;
}

export interface Reset21State {
  day: number;
  points: number;
  streak: number;
  mode: "foundation" | "build" | null;
  completedTasks: string[];
  started: boolean;
  currentDayTasks: {
    required: Task | null;
    optional: Task[];
  };
  // ✅ Tracks the date string (YYYY-MM-DD) when the current day cycle began
  lastResetDate: string | null;
}

export interface Reset21Actions {
  startChallenge: (mode: "foundation" | "build") => void;
  completeTask: (taskId: string) => void;
  // ✅ Checks if 4 AM has passed and auto-advances day
  checkDayRollover: () => void;
  generateDailyTasks: () => void;
  reset: () => void;
}

const TASKS = {
  foundation: [
    {
      id: "f1",
      title: "Morning Hydration",
      category: "Physical",
      desc: "Drink a full glass of water immediately.",
      points: 10,
      type: "action" as const,
    },
    {
      id: "f2",
      title: "5 Min Walk",
      category: "Physical",
      desc: "Step outside for fresh air.",
      points: 15,
      type: "timed",
      duration: 300,
    },
    {
      id: "f3",
      title: "Read 5 Pages",
      category: "Mindfulness",
      desc: "Read a physical book.",
      points: 20,
      type: "action",
    },
    {
      id: "f4",
      title: "No Phone Zone",
      category: "Deep Work",
      desc: "No phone for 30 mins after waking.",
      points: 25,
      type: "timed",
      duration: 1800,
    },
    {
      id: "f5",
      title: "Gratitude List",
      category: "Mindfulness",
      desc: "Write down 3 things you are grateful for.",
      points: 10,
      type: "action",
    },
    {
      id: "f6",
      title: "Make Bed",
      category: "Physical",
      desc: "Tidy your sleeping space.",
      points: 5,
      type: "action",
    },
    {
      id: "f7",
      title: "Stretching",
      category: "Physical",
      desc: "Full body stretch routine.",
      points: 15,
      type: "timed",
      duration: 300,
    },
  ],
  build: [
    {
      id: "b1",
      title: "Cold Shower",
      category: "Physical",
      desc: "End your shower with 2 mins cold.",
      points: 30,
      type: "timed",
      duration: 120,
    },
    {
      id: "b2",
      title: "Deep Work Session",
      category: "Deep Work",
      desc: "Focused work without distraction.",
      points: 50,
      type: "timed",
      duration: 1500,
    },
    {
      id: "b3",
      title: "Meditation",
      category: "Mindfulness",
      desc: "Guided or silent meditation.",
      points: 25,
      type: "timed",
      duration: 600,
    },
    {
      id: "b4",
      title: "No Sugar",
      category: "Physical",
      desc: "Zero added sugar today.",
      points: 40,
      type: "action",
    },
    {
      id: "b5",
      title: "Social Connection",
      category: "Social",
      desc: "Call a friend or family member.",
      points: 20,
      type: "timed",
      duration: 300,
    },
    {
      id: "b6",
      title: "Journaling",
      category: "Mindfulness",
      desc: "Stream of consciousness writing.",
      points: 25,
      type: "timed",
      duration: 600,
    },
    {
      id: "b7",
      title: "HIIT Workout",
      category: "Physical",
      desc: "High intensity interval training.",
      points: 45,
      type: "timed",
      duration: 900,
    },
  ],
};

const generateDailyTasks = (
  mode: "foundation" | "build",
): { required: Task; optional: Task[] } => {
  const pool = TASKS[mode];
  const requiredIndex = Math.floor(Math.random() * pool.length);
  const required = { ...pool[requiredIndex], isRequired: true } as Task;
  const optional: Task[] = [];
  while (optional.length < 2) {
    const idx = Math.floor(Math.random() * pool.length);
    if (idx !== requiredIndex && !optional.find((t) => t.id === pool[idx].id)) {
      optional.push({ ...pool[idx], isRequired: false } as Task);
    }
  }
  return { required, optional };
};

// ✅ Helper: Get today's date string (YYYY-MM-DD)
const getTodayString = () => new Date().toISOString().split("T")[0];

// ✅ Helper: Check if current time is past 4 AM relative to lastResetDate
const isPast4AM = (lastResetDate: string | null) => {
  if (!lastResetDate) return false;
  const now = new Date();
  // Construct the 4 AM threshold for the day AFTER lastResetDate
  const threshold = new Date(`${lastResetDate}T04:00:00`);
  threshold.setDate(threshold.getDate() + 1);
  return now >= threshold;
};

export const useReset21Store = create<Reset21State & Reset21Actions>()(
  persist(
    (set, get) => ({
      day: 1,
      points: 0,
      streak: 0,
      mode: null,
      completedTasks: [],
      started: false,
      currentDayTasks: { required: null, optional: [] },
      lastResetDate: null,

      startChallenge: (mode) => {
        const today = getTodayString();
        const { required, optional } = generateDailyTasks(mode);
        set({
          mode,
          started: true,
          lastResetDate: today, // ✅ Anchor start date
          day: 1,
          points: 0,
          streak: 0,
          completedTasks: [],
          currentDayTasks: { required, optional },
        });
      },

      completeTask: (taskId) => {
        const state = get();
        if (!state.currentDayTasks.required) return;

        const task =
          state.currentDayTasks.required.id === taskId
            ? state.currentDayTasks.required
            : state.currentDayTasks.optional.find((t) => t.id === taskId);
        
        if (!task) return;
        if (state.completedTasks.includes(taskId)) return; // Already done

        const newPoints = state.points + task.points;
        
        // ✅ UPDATED: Only mark task as done. DO NOT advance day here.
        // ✅ DO NOT lock optional tasks.
        set({
          points: newPoints,
          completedTasks: [...state.completedTasks, taskId],
        });
      },

      // ✅ UPDATED: Check if 4 AM has passed and auto-advance
      checkDayRollover: () => {
        const state = get();
        if (!state.started || !state.lastResetDate) return;

        // ✅ Check if current time is past 4 AM threshold
        if (isPast4AM(state.lastResetDate)) {
          const requiredId = state.currentDayTasks.required?.id;
          const wasRequiredDone = requiredId && state.completedTasks.includes(requiredId);

          let newStreak = state.streak;
          
          // ✅ Streak Logic: Only increment if required task was completed before 4 AM
          if (wasRequiredDone) {
            newStreak = state.streak + 1;
          } else {
            // Streak broken if required task missed
            newStreak = 0; 
          }

          let newDay = state.day + 1;

          // ✅ Check Challenge Completion
          if (newDay > 21) {
            set({
              day: newDay,
              streak: newStreak,
              completedTasks: [],
            });
            return;
          }

          // ✅ Advance Day
          const { required, optional } = generateDailyTasks(state.mode!);
          set({
            day: newDay,
            streak: newStreak,
            completedTasks: [], // Reset for new day
            currentDayTasks: { required, optional },
            lastResetDate: getTodayString(), // ✅ Update anchor to today
          });
        }
      },

      generateDailyTasks: () => {
        const state = get();
        if (state.mode) {
          const { required, optional } = generateDailyTasks(state.mode);
          set({ currentDayTasks: { required, optional } });
        }
      },

      reset: () => {
        set({
          day: 1,
          points: 0,
          streak: 0,
          mode: null,
          completedTasks: [],
          started: false,
          currentDayTasks: { required: null, optional: [] },
          lastResetDate: null,
        });
      },
    }),
    {
      name: "reset21-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);