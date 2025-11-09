import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: Date;
  type: 'smart' | 'manual';
  foodName?: string;
  quantity?: number;
  unit?: string;
  mealType?: string;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  waterIntake: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
}

interface NutritionStore {
  // State
  todayNutrition: DailyNutrition;
  targets: NutritionTargets;
  quickLogInput: string;
  recentFoods: Meal[];
  
  // Actions
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  updateMeal: (mealId: string, updates: Partial<Meal>) => void;
  setQuickLogInput: (input: string) => void;
  clearQuickLogInput: () => void;
  addWaterIntake: (amount: number) => void;
  setTargets: (targets: Partial<NutritionTargets>) => void;
  addToRecentFoods: (meal: Meal) => void;
  resetToday: () => void;
}

const initialDayNutrition: DailyNutrition = {
  date: new Date().toISOString().split('T')[0],
  meals: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFats: 0,
  waterIntake: 0,
};

const defaultTargets: NutritionTargets = {
  calories: 2500,
  protein: 180,
  carbs: 250,
  fats: 80,
  water: 3000,
};

export const useNutritionStore = create<NutritionStore>()(
  devtools(
    persist(
      (set, get) => ({
        todayNutrition: initialDayNutrition,
        targets: defaultTargets,
        quickLogInput: '',
        recentFoods: [],

        addMeal: (meal) => set((state) => {
          const newMeals = [...state.todayNutrition.meals, meal];
          return {
            todayNutrition: {
              ...state.todayNutrition,
              meals: newMeals,
              totalCalories: state.todayNutrition.totalCalories + meal.calories,
              totalProtein: state.todayNutrition.totalProtein + meal.protein,
              totalCarbs: state.todayNutrition.totalCarbs + meal.carbs,
              totalFats: state.todayNutrition.totalFats + meal.fats,
            },
          };
        }),

        removeMeal: (mealId) => set((state) => {
          const mealToRemove = state.todayNutrition.meals.find(m => m.id === mealId);
          if (!mealToRemove) return state;
          
          return {
            todayNutrition: {
              ...state.todayNutrition,
              meals: state.todayNutrition.meals.filter(m => m.id !== mealId),
              totalCalories: state.todayNutrition.totalCalories - mealToRemove.calories,
              totalProtein: state.todayNutrition.totalProtein - mealToRemove.protein,
              totalCarbs: state.todayNutrition.totalCarbs - mealToRemove.carbs,
              totalFats: state.todayNutrition.totalFats - mealToRemove.fats,
            },
          };
        }),

        updateMeal: (mealId, updates) => set((state) => ({
          todayNutrition: {
            ...state.todayNutrition,
            meals: state.todayNutrition.meals.map(m =>
              m.id === mealId ? { ...m, ...updates } : m
            ),
          },
        })),

        setQuickLogInput: (input) => set({ quickLogInput: input }),
        
        clearQuickLogInput: () => set({ quickLogInput: '' }),

        addWaterIntake: (amount) => set((state) => ({
          todayNutrition: {
            ...state.todayNutrition,
            waterIntake: state.todayNutrition.waterIntake + amount,
          },
        })),

        setTargets: (targets) => set((state) => ({
          targets: { ...state.targets, ...targets },
        })),

        addToRecentFoods: (meal) => set((state) => {
          const recentFoods = [meal, ...state.recentFoods.filter(f => f.name !== meal.name)]
            .slice(0, 10);
          return { recentFoods };
        }),

        resetToday: () => set({
          todayNutrition: {
            ...initialDayNutrition,
            date: new Date().toISOString().split('T')[0],
          },
        }),
      }),
      {
        name: 'nutrition-store',
        partialize: (state) => ({
          targets: state.targets,
          recentFoods: state.recentFoods,
        }),
      }
    )
  )
);
