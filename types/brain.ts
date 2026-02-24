  //path: types/brain.ts
  export interface Activity {
    id: string;
    label: string;
    icon: string;
    energyDelta: number;
    volatilityDelta: number;
    color: string;
    isAddictive?: boolean;
  }

  export interface LoggedActivity {
    activityId: string;
    timestamp: string;
  }

  export interface DailyLog {
    date: string;
    energy: number;
    volatility: number;
    momentum: number;
    activities: LoggedActivity[];
  }

  // --- SPLIT STATE TYPES ---

  // 1. Volatile (RAM Only) - High Frequency
  export interface BrainSessionState {
    energy: number;
    volatility: number;
    momentum: number;
    phase: "DAY" | "NIGHT";
    todayActivities: LoggedActivity[];
  }

  export interface BrainSessionActions {
    logActivity: (activity: Activity) => void;
    resetSession: (energy: number, volatility: number) => void;
    getSnapshot: () => Omit<DailyLog, "date">;
  }

  // 2. Persistent (Disk Only) - Low Frequency
  export interface BrainHistoryState {
    lastReset: string;
    history: DailyLog[];
  }

  export interface BrainHistoryActions {
    saveDailyLog: (log: DailyLog) => void;
    updateLastReset: (date: string) => void;
  }
