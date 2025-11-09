import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface SleepEntry {
  id: string;
  date: string;
  hoursSlept: number;
  quality: number; // 1-10
  soreness: number; // 1-10
  stress: number; // 1-10
  notes?: string;
  timestamp: Date;
}

export interface RecoveryMetrics {
  avgSleep7Days: number;
  avgQuality7Days: number;
  avgSoreness7Days: number;
  recoveryScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
}

interface SleepStore {
  // State
  recentEntries: SleepEntry[];
  todayEntry: SleepEntry | null;
  recoveryMetrics: RecoveryMetrics | null;
  
  // Actions
  addSleepEntry: (entry: SleepEntry) => void;
  updateSleepEntry: (id: string, updates: Partial<SleepEntry>) => void;
  setTodayEntry: (entry: SleepEntry) => void;
  calculateRecoveryMetrics: () => void;
  loadRecentEntries: (entries: SleepEntry[]) => void;
}

const defaultRecoveryMetrics: RecoveryMetrics = {
  avgSleep7Days: 0,
  avgQuality7Days: 0,
  avgSoreness7Days: 0,
  recoveryScore: 0,
  trend: 'stable',
};

export const useSleepStore = create<SleepStore>()(
  devtools(
    persist(
      (set, get) => ({
        recentEntries: [],
        todayEntry: null,
        recoveryMetrics: null,

        addSleepEntry: (entry) => set((state) => {
          const newEntries = [entry, ...state.recentEntries].slice(0, 30);
          return {
            recentEntries: newEntries,
            todayEntry: entry.date === new Date().toISOString().split('T')[0] ? entry : state.todayEntry,
          };
        }),

        updateSleepEntry: (id, updates) => set((state) => ({
          recentEntries: state.recentEntries.map(e =>
            e.id === id ? { ...e, ...updates } : e
          ),
          todayEntry: state.todayEntry?.id === id
            ? { ...state.todayEntry, ...updates }
            : state.todayEntry,
        })),

        setTodayEntry: (entry) => set({ todayEntry: entry }),

        calculateRecoveryMetrics: () => {
          const entries = get().recentEntries.slice(0, 7);
          
          if (entries.length === 0) {
            set({ recoveryMetrics: defaultRecoveryMetrics });
            return;
          }

          const avgSleep = entries.reduce((acc, e) => acc + e.hoursSlept, 0) / entries.length;
          const avgQuality = entries.reduce((acc, e) => acc + e.quality, 0) / entries.length;
          const avgSoreness = entries.reduce((acc, e) => acc + e.soreness, 0) / entries.length;

          // Recovery score calculation
          const sleepScore = (avgSleep / 9) * 40; // Max 40 points
          const qualityScore = (avgQuality / 10) * 40; // Max 40 points
          const sorenessScore = ((10 - avgSoreness) / 10) * 20; // Max 20 points (inverted)
          const recoveryScore = Math.min(100, sleepScore + qualityScore + sorenessScore);

          // Trend calculation
          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          if (entries.length >= 3) {
            const recent3 = entries.slice(0, 3);
            const older3 = entries.slice(3, 6);
            const recentAvg = recent3.reduce((acc, e) => acc + e.quality, 0) / recent3.length;
            const olderAvg = older3.reduce((acc, e) => acc + e.quality, 0) / older3.length;
            
            if (recentAvg > olderAvg + 1) trend = 'improving';
            else if (recentAvg < olderAvg - 1) trend = 'declining';
          }

          set({
            recoveryMetrics: {
              avgSleep7Days: Math.round(avgSleep * 10) / 10,
              avgQuality7Days: Math.round(avgQuality * 10) / 10,
              avgSoreness7Days: Math.round(avgSoreness * 10) / 10,
              recoveryScore: Math.round(recoveryScore),
              trend,
            },
          });
        },

        loadRecentEntries: (entries) => {
          set({ recentEntries: entries });
          get().calculateRecoveryMetrics();
        },
      }),
      {
        name: 'sleep-store',
        partialize: (state) => ({
          recentEntries: state.recentEntries.slice(0, 7),
        }),
      }
    )
  )
);
