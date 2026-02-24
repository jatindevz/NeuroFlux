// utils/trendStats.ts
import { DailyLog } from "@/types/brain";

export interface MetricStats {
  min: number;
  max: number;
  avg: number;
}

export interface BrainStats {
  energy: MetricStats;
  volatility: MetricStats;
  momentum: MetricStats;
}

export function computeStats(history: DailyLog[]): BrainStats {
  if (history.length === 0) {
    return {
      energy: { min: 0, max: 0, avg: 0 },
      volatility: { min: 0, max: 0, avg: 0 },
      momentum: { min: 0, max: 0, avg: 0 },
    };
  }

  const energyValues = history.map((h) => h.energy);
  const volatilityValues = history.map((h) => h.volatility);
  const momentumValues = history.map((h) => h.momentum);

  const energyAvg =
    energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
  const volatilityAvg =
    volatilityValues.reduce((a, b) => a + b, 0) / volatilityValues.length;
  const momentumAvg =
    momentumValues.reduce((a, b) => a + b, 0) / momentumValues.length;

  return {
    energy: {
      min: Math.min(...energyValues),
      max: Math.max(...energyValues),
      avg: Math.round(energyAvg),
    },
    volatility: {
      min: Math.min(...volatilityValues),
      max: Math.max(...volatilityValues),
      avg: Math.round(volatilityAvg),
    },
    momentum: {
      min: Math.min(...momentumValues),
      max: Math.max(...momentumValues),
      avg: Math.round(momentumAvg * 10) / 10,
    },
  };
}

// Simple linear regression prediction for next value
export function predictNextValue(data: number[]): number | null {
  if (data.length < 3) return null;

  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((acc, i) => acc + i * data[i], 0);
  const sumX2 = indices.reduce((acc, i) => acc + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const nextIndex = n; // predict next point
  return intercept + slope * nextIndex;
}
