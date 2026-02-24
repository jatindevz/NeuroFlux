import {
  Activity,
  BrainHistoryActions,
  BrainHistoryState,
  BrainSessionActions,
  BrainSessionState,
  DailyLog,
} from "@/types/brain";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// helper to compute today's ISO date string
const getToday = (): string => new Date().toISOString().split("T")[0];

// Combined store interface
export interface BrainStore
  extends BrainSessionState,
    BrainHistoryState,
    BrainSessionActions,
    BrainHistoryActions {
  endDay: () => void;
  resetDay: () => void;
  checkAndResetDay: () => void;
}

// single zustand store for both session (volatile) and history (persistent)
export const useBrainStore = create<BrainStore>()(
  persist(
    (set, get) => ({
      // --- session state ---
      energy: 70,
      volatility: 25,
      momentum: 0,
      phase: "DAY",
      todayActivities: [],

      // --- history / persistence state ---
      lastReset: getToday(),
      history: [],

      // --- session actions ---
      logActivity: (activity: Activity) => {
        const state = get();
        if (state.phase === "NIGHT") return;

        let repetitionMultiplier = 1;
        if (activity.isAddictive) {
          const sameCount = state.todayActivities.filter(
            (a) => a.activityId === activity.id,
          ).length;
          repetitionMultiplier = 1 + sameCount * 0.25;
        }

        const adjustedEnergyDelta = activity.energyDelta * repetitionMultiplier;
        const adjustedVolatilityDelta =
          activity.volatilityDelta * repetitionMultiplier;

        const newEnergy = Math.max(
          0,
          Math.min(100, state.energy + adjustedEnergyDelta),
        );
        const newVolatility = Math.max(
          0,
          Math.min(100, state.volatility + adjustedVolatilityDelta),
        );

        const newLoggedActivity: DailyLog["activities"][0] = {
          activityId: activity.id,
          timestamp: new Date().toISOString(),
        };

        const newMomentum = Math.max(
          -10,
          Math.min(10, state.momentum * 0.6 + adjustedEnergyDelta * 0.4),
        );

        set({
          energy: newEnergy,
          volatility: newVolatility,
          momentum: Math.round(newMomentum * 10) / 10,
          todayActivities: [...state.todayActivities, newLoggedActivity],
        });
      },

      resetSession: (energy, volatility) => {
        set({
          energy,
          volatility,
          momentum: 0,
          phase: "DAY",
          todayActivities: [],
        });
      },

      getSnapshot: () => {
        const s = get();
        return {
          energy: s.energy,
          volatility: s.volatility,
          momentum: s.momentum,
          activities: s.todayActivities,
        };
      },

      // --- history actions ---
      saveDailyLog: (log: DailyLog) => {
        const s = get();
        const filteredHistory = s.history.filter((h) => h.date !== log.date);
        set({ history: [log, ...filteredHistory].slice(0, 30) });
      },

      updateLastReset: (date: string) => {
        set({ lastReset: date });
      },

      // --- higher-level helpers ---
      endDay: () => {
        const s = get();
        if (s.phase === "NIGHT") return;
        const snapshot = s.getSnapshot();
        const log: DailyLog = {
          date: s.lastReset,
          ...snapshot,
        };
        s.saveDailyLog(log);
        set({ phase: "NIGHT" });
      },

      resetDay: () => {
        const s = get();
        const VOLATILITY_CARRY_IMPACT = 0.2;
        const penalizedEnergy = Math.max(
          0,
          s.energy - s.volatility * VOLATILITY_CARRY_IMPACT,
        );
        const carryEnergy = Math.round(penalizedEnergy * 0.6 + 40 * 0.4);
        const carryVolatility = Math.round(s.volatility * 0.3);

        s.resetSession(carryEnergy, carryVolatility);
        s.updateLastReset(new Date().toISOString().split("T")[0]);
      },

      checkAndResetDay: () => {
        const s = get();
        const today = new Date().toISOString().split("T")[0];
        if (s.lastReset !== today) {
          // day changed since last use; capture the previous day's log if we were
          // still in the DAY phase. we *don't* perform the reset here because
          // the UI now expects the user to press "New Day" manually.
          if (s.phase === "DAY" && s.todayActivities.length > 0) {
            const snapshot = s.getSnapshot();
            const log: DailyLog = {
              date: s.lastReset,
              ...snapshot,
            };
            s.saveDailyLog(log);
            set({ phase: "NIGHT" });
          }

          // the old auto‑reset logic is preserved below for reference; if you
          // ever want the store to handle the rollover automatically, uncomment
          // the block and remove the manual button from the UI.
          /*
          const allowedReset = new Date(`${s.lastReset}T04:00:00`);
          allowedReset.setDate(allowedReset.getDate() + 1);
          const now = new Date();

          if (now >= allowedReset) {
            const VOLATILITY_CARRY_IMPACT = 0.2;
            const penalizedEnergy = Math.max(
              0,
              s.energy - s.volatility * VOLATILITY_CARRY_IMPACT,
            );
            const carryEnergy = Math.round(
              penalizedEnergy * 0.6 + 40 * 0.4,
            );
            const carryVolatility = Math.round(s.volatility * 0.3);

            s.resetSession(carryEnergy, carryVolatility);
            s.updateLastReset(today);
          }
          */
        }
      },
    }),
    {
      name: "brain-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useBrainStore;
