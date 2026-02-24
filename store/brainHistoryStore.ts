import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BrainHistoryState,
  BrainHistoryActions,
  DailyLog,
} from "@/types/brain";

const getToday = (): string => new Date().toISOString().split("T")[0];

export const useBrainHistoryStore = create<
  BrainHistoryState & BrainHistoryActions
>()(
  persist(
    (set, get) => ({
      lastReset: getToday(),
      history: [],

      saveDailyLog: (log: DailyLog) => {
        const state = get();
        const filteredHistory = state.history.filter(
          (h) => h.date !== log.date,
        );
        set({
          history: [log, ...filteredHistory].slice(0, 30),
        });
      },

      updateLastReset: (date: string) => {
        set({ lastReset: date });
      },
    }),
    {
      name: "brain-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
