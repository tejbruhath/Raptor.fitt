import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface WorkoutSet {
  reps: number;
  weight: number;
  rpe?: number;
  timestamp: Date;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: WorkoutSet[];
  notes?: string;
  isPR?: boolean;
}

export interface WorkoutSession {
  id?: string;
  exercises: WorkoutExercise[];
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
  duration: number;
  notes?: string;
}

interface WorkoutStore {
  // Session state
  currentSession: WorkoutSession;
  sessionMode: boolean;
  restTimer: {
    isActive: boolean;
    remaining: number;
    duration: number;
  };
  
  // Quick log state
  quickLogInput: string;
  lastExercise: WorkoutExercise | null;
  
  // Actions
  startSession: () => void;
  endSession: () => void;
  addExercise: (exercise: WorkoutExercise) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, set: WorkoutSet) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  updateSet: (exerciseId: string, setIndex: number, set: Partial<WorkoutSet>) => void;
  setQuickLogInput: (input: string) => void;
  clearQuickLogInput: () => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  reset: () => void;
}

const initialSession: WorkoutSession = {
  exercises: [],
  startTime: null,
  endTime: null,
  isActive: false,
  duration: 0,
  notes: '',
};

export const useWorkoutStore = create<WorkoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: initialSession,
        sessionMode: false,
        restTimer: {
          isActive: false,
          remaining: 0,
          duration: 90,
        },
        quickLogInput: '',
        lastExercise: null,

        startSession: () => set({
          currentSession: {
            ...initialSession,
            startTime: new Date(),
            isActive: true,
          },
          sessionMode: true,
        }),

        endSession: () => {
          const session = get().currentSession;
          if (session.startTime) {
            const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
            set({
              currentSession: {
                ...session,
                endTime: new Date(),
                isActive: false,
                duration,
              },
              sessionMode: false,
            });
          }
        },

        addExercise: (exercise) => set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: [...state.currentSession.exercises, exercise],
          },
          lastExercise: exercise,
        })),

        removeExercise: (exerciseId) => set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: state.currentSession.exercises.filter(e => e.id !== exerciseId),
          },
        })),

        addSet: (exerciseId, set) => set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: state.currentSession.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: [...ex.sets, set] }
                : ex
            ),
          },
        })),

        removeSet: (exerciseId, setIndex) => set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: state.currentSession.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
                : ex
            ),
          },
        })),

        updateSet: (exerciseId, setIndex, updatedSet) => set((state) => ({
          currentSession: {
            ...state.currentSession,
            exercises: state.currentSession.exercises.map(ex =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map((s, i) =>
                      i === setIndex ? { ...s, ...updatedSet } : s
                    ),
                  }
                : ex
            ),
          },
        })),

        setQuickLogInput: (input) => set({ quickLogInput: input }),
        
        clearQuickLogInput: () => set({ quickLogInput: '' }),

        startRestTimer: (duration) => set({
          restTimer: {
            isActive: true,
            remaining: duration,
            duration,
          },
        }),

        stopRestTimer: () => set({
          restTimer: {
            isActive: false,
            remaining: 0,
            duration: 90,
          },
        }),

        tickRestTimer: () => set((state) => {
          if (state.restTimer.remaining <= 1) {
            return {
              restTimer: {
                isActive: false,
                remaining: 0,
                duration: state.restTimer.duration,
              },
            };
          }
          return {
            restTimer: {
              ...state.restTimer,
              remaining: state.restTimer.remaining - 1,
            },
          };
        }),

        reset: () => set({
          currentSession: initialSession,
          sessionMode: false,
          quickLogInput: '',
        }),
      }),
      {
        name: 'workout-store',
        partialize: (state) => ({
          lastExercise: state.lastExercise,
        }),
      }
    )
  )
);
