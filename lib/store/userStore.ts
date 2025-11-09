import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  bodyweight: number[];
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'bulk' | 'cut' | 'recomp' | 'strength' | 'endurance';
  trainingAge: number;
  estimatedBodyFat: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  measurements?: {
    chest: number;
    waist: number;
    arms: number;
    thighs: number;
    calves: number;
    shoulders: number;
  };
  settings: {
    theme: string;
    units: 'metric' | 'imperial';
    notifications: boolean;
    darkMode: boolean;
    language: string;
    autoSave: boolean;
    restTimerDefault: number;
  };
}

export interface StreakData {
  current: number;
  longest: number;
  lastActive: Date;
}

export interface DailyCheckIn {
  date: string;
  feeling: 'great' | 'good' | 'okay' | 'tired' | 'exhausted';
  waterIntake: boolean;
  mood: number; // 1-10
}

interface UserStore {
  // State
  profile: UserProfile | null;
  streak: StreakData;
  dailyCheckIn: DailyCheckIn | null;
  onboarded: boolean;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addBodyweight: (weight: number) => void;
  updateMeasurements: (measurements: Partial<UserProfile['measurements']>) => void;
  updateSettings: (settings: Partial<UserProfile['settings']>) => void;
  updateStreak: (days: number) => void;
  setDailyCheckIn: (checkIn: DailyCheckIn) => void;
  setOnboarded: (status: boolean) => void;
  reset: () => void;
}

const defaultSettings: UserProfile['settings'] = {
  theme: 'dark',
  units: 'metric',
  notifications: true,
  darkMode: true,
  language: 'en',
  autoSave: true,
  restTimerDefault: 90,
};

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        streak: {
          current: 0,
          longest: 0,
          lastActive: new Date(),
        },
        dailyCheckIn: null,
        onboarded: false,

        setProfile: (profile) => set({ profile }),

        updateProfile: (updates) => set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

        addBodyweight: (weight) => set((state) => {
          if (!state.profile) return state;
          const newBodyweights = [...state.profile.bodyweight, weight].slice(-30);
          return {
            profile: {
              ...state.profile,
              bodyweight: newBodyweights,
            },
          };
        }),

        updateMeasurements: (measurements) => set((state) => {
          if (!state.profile) return state;
          const currentMeasurements = state.profile.measurements || {
            chest: 0,
            waist: 0,
            arms: 0,
            thighs: 0,
            calves: 0,
            shoulders: 0,
          };
          return {
            profile: {
              ...state.profile,
              measurements: {
                ...currentMeasurements,
                ...measurements,
              },
            },
          };
        }),

        updateSettings: (settings) => set((state) => {
          if (!state.profile) return state;
          return {
            profile: {
              ...state.profile,
              settings: {
                ...state.profile.settings,
                ...settings,
              },
            },
          };
        }),

        updateStreak: (days) => set((state) => ({
          streak: {
            current: days,
            longest: Math.max(days, state.streak.longest),
            lastActive: new Date(),
          },
        })),

        setDailyCheckIn: (checkIn) => set({ dailyCheckIn: checkIn }),

        setOnboarded: (status) => set({ onboarded: status }),

        reset: () => set({
          profile: null,
          streak: {
            current: 0,
            longest: 0,
            lastActive: new Date(),
          },
          dailyCheckIn: null,
          onboarded: false,
        }),
      }),
      {
        name: 'user-store',
      }
    )
  )
);
