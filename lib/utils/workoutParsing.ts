/**
 * Workout Quick-Add Parsing
 * Supports formats like:
 * - "Bench 100x8"
 * - "Squat 120x5x3" (weight x reps x sets)
 * - "80x10"
 * - "Deadlift 140*6"
 */

export interface ParsedSet {
  weight: number;
  reps: number;
}

export interface ParsedWorkout {
  exerciseName?: string;
  sets: ParsedSet[];
}

/**
 * Parse quick-add workout format
 * @param input String like "Bench 100x8" or "80x10x3"
 * @returns Parsed workout data or null
 */
export function parseQuickWorkout(input: string): ParsedWorkout | null {
  if (!input || input.trim().length < 3) return null;

  const cleaned = input.trim();

  // Pattern 1: "Exercise 100x8" or "Exercise 100*8"
  const withExercise = cleaned.match(/^(.+?)\s+(\d+\.?\d*)[x*×](\d+)(?:[x*×](\d+))?$/i);
  
  // Pattern 2: Just "100x8" or "100x8x3"
  const withoutExercise = cleaned.match(/^(\d+\.?\d*)[x*×](\d+)(?:[x*×](\d+))?$/i);

  if (withExercise) {
    const exerciseName = withExercise[1].trim();
    const weight = parseFloat(withExercise[2]);
    const reps = parseInt(withExercise[3]);
    const numSets = withExercise[4] ? parseInt(withExercise[4]) : 1;

    return {
      exerciseName,
      sets: Array(numSets).fill(null).map(() => ({ weight, reps })),
    };
  }

  if (withoutExercise) {
    const weight = parseFloat(withoutExercise[1]);
    const reps = parseInt(withoutExercise[2]);
    const numSets = withoutExercise[3] ? parseInt(withoutExercise[3]) : 1;

    return {
      sets: Array(numSets).fill(null).map(() => ({ weight, reps })),
    };
  }

  return null;
}

/**
 * Check if input looks like quick-add format
 */
export function isQuickAddFormat(input: string): boolean {
  return /\d+\.?\d*[x*×]\d+/i.test(input);
}

/**
 * Calculate total volume for a set
 */
export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total volume for multiple sets
 */
export function calculateTotalVolume(sets: ParsedSet[]): number {
  return sets.reduce((total, set) => total + calculateVolume(set.weight, set.reps), 0);
}

/**
 * Compare current session volume to previous
 * @param currentSets Current workout sets
 * @param previousSets Previous workout sets
 * @returns Percentage change
 */
export function compareVolume(currentSets: ParsedSet[], previousSets: ParsedSet[]): number {
  const currentVolume = calculateTotalVolume(currentSets);
  const previousVolume = calculateTotalVolume(previousSets);

  if (previousVolume === 0) return 0;

  return Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
}

/**
 * Detect if weight is a new PR
 * @param weight Current weight
 * @param previousMax Previous max weight
 * @returns True if new PR
 */
export function isNewPR(weight: number, previousMax: number): boolean {
  return weight > previousMax;
}

/**
 * Calculate estimated 1RM using Epley formula
 * @param weight Weight lifted
 * @param reps Reps performed
 * @returns Estimated 1RM
 */
export function estimate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Suggest next weight based on progressive overload
 * @param lastWeight Last session's weight
 * @param lastReps Last session's reps
 * @returns Suggested weight for next session
 */
export function suggestNextWeight(lastWeight: number, lastReps: number): number {
  // If reps >= 10, suggest 2.5kg increase
  if (lastReps >= 10) return lastWeight + 2.5;
  
  // If reps >= 8, suggest 2.5kg increase
  if (lastReps >= 8) return lastWeight + 2.5;
  
  // If reps < 8, suggest same weight (aim for more reps)
  return lastWeight;
}

/**
 * Format workout for display
 * @param sets Array of sets
 * @returns Formatted string like "3 sets × 8 reps @ 100kg"
 */
export function formatWorkoutSummary(sets: ParsedSet[]): string {
  if (sets.length === 0) return '';
  
  const firstSet = sets[0];
  const allSame = sets.every(s => s.weight === firstSet.weight && s.reps === firstSet.reps);
  
  if (allSame) {
    return `${sets.length} sets × ${firstSet.reps} reps @ ${firstSet.weight}kg`;
  }
  
  return sets.map((s, i) => `Set ${i + 1}: ${s.weight}kg × ${s.reps}`).join(', ');
}
