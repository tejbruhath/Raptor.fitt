import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate 1RM using Epley formula
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// Calculate total volume for a workout
export function calculateVolume(sets: { reps: number; weight: number }[]): number {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0);
}

// Format date to string
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Calculate macro percentages
export function calculateMacroPercentages(protein: number, carbs: number, fats: number) {
  const total = protein * 4 + carbs * 4 + fats * 9;
  return {
    protein: ((protein * 4) / total) * 100,
    carbs: ((carbs * 4) / total) * 100,
    fats: ((fats * 9) / total) * 100,
  };
}

// Get trend indicator
export function getTrendIndicator(current: number, previous: number): '↑' | '↓' | '→' {
  const diff = current - previous;
  const threshold = Math.abs(previous * 0.01); // 1% threshold
  if (Math.abs(diff) < threshold) return '→';
  return diff > 0 ? '↑' : '↓';
}

// Format percentage change
export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) return '+0.0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

// Generate gradient color based on value (0-100)
export function getGradientColor(value: number): string {
  if (value < 33) return 'from-negative to-accent';
  if (value < 66) return 'from-warning to-primary';
  return 'from-primary to-positive';
}
