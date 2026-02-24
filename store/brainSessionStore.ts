import { create } from "zustand";
import {
  Activity,
  BrainSessionState,
  BrainSessionActions,
  LoggedActivity,
} from "@/types/brain";

const useBrainSessionStore = create<BrainSessionState & BrainSessionActions>()(
  (set, get) => ({
    energy: 70,
    volatility: 25,
    momentum: 0,
    phase: "DAY",
    todayActivities: [],

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

      const newLoggedActivity: LoggedActivity = {
        activityId: activity.id,
        timestamp: new Date().toISOString(),
      };

      const newMomentum = Math.max(
        -10,
        Math.min(10, state.momentum * 0.6 + adjustedEnergyDelta * 0.4),
      );

      // NO PERSIST HERE. PURE RAM.
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
      const state = get();
      return {
        energy: state.energy,
        volatility: state.volatility,
        momentum: state.momentum,
        activities: state.todayActivities,
      };
    },
  }),
);

export default useBrainSessionStore;
