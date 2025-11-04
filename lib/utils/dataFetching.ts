/**
 * Data fetching utilities for smart logging features
 */

interface ExerciseTemplate {
  name: string;
  muscleGroup: string;
  lastWeight?: number;
  lastReps?: number;
  lastSets?: number;
  suggestedWeight?: number;
  timesLogged?: number;
  lastLoggedAt?: Date;
}

interface WorkoutPR {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  estimated1RM?: number;
  achievedAt: Date;
}

/**
 * Fetch recent exercises for a user (last 3 unique)
 */
export async function fetchRecentExercises(userId: string): Promise<ExerciseTemplate[]> {
  try {
    const response = await fetch(`/api/exercise-templates?userId=${userId}&limit=3`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Failed to fetch recent exercises:', error);
    return [];
  }
}

/**
 * Fetch suggested exercises based on muscle group rotation
 */
export async function fetchSuggestedExercises(userId: string): Promise<ExerciseTemplate[]> {
  try {
    const response = await fetch(`/api/exercise-templates/suggested?userId=${userId}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Failed to fetch suggested exercises:', error);
    return [];
  }
}

/**
 * Fetch user's PRs for all exercises
 */
export async function fetchUserPRs(userId: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(`/api/workout-prs?userId=${userId}`);
    if (!response.ok) return {};
    const data = await response.json();
    
    // Convert array to map of exercise name -> max weight
    const prsMap: Record<string, number> = {};
    data.prs?.forEach((pr: WorkoutPR) => {
      prsMap[pr.exerciseName] = pr.maxWeight;
    });
    return prsMap;
  } catch (error) {
    console.error('Failed to fetch PRs:', error);
    return {};
  }
}

/**
 * Fetch PR for specific exercise
 */
export async function fetchExercisePR(userId: string, exerciseName: string): Promise<number> {
  try {
    const response = await fetch(
      `/api/workout-prs/${encodeURIComponent(exerciseName)}?userId=${encodeURIComponent(String(userId))}`
    );
    if (!response.ok) return 0;
    const data = await response.json();
    return data.pr?.maxWeight || 0;
  } catch (error) {
    console.error('Failed to fetch exercise PR:', error);
    return 0;
  }
}

/**
 * Fetch last workout data for an exercise
 */
export async function fetchLastWorkout(userId: string, exerciseName: string) {
  try {
    const response = await fetch(`/api/workouts/last?userId=${userId}&exercise=${encodeURIComponent(exerciseName)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.workout || null;
  } catch (error) {
    console.error('Failed to fetch last workout:', error);
    return null;
  }
}

/**
 * Fetch recently used foods (last 10 unique)
 */
export async function fetchRecentFoods(userId: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/nutrition/recent-foods?userId=${userId}&limit=10`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error('Failed to fetch recent foods:', error);
    return [];
  }
}

/**
 * Calculate volume comparison vs last session
 */
export async function fetchVolumeComparison(
  userId: string,
  currentVolume: number,
  exerciseName?: string
): Promise<number> {
  try {
    const query = exerciseName 
      ? `/api/workouts/volume-comparison?userId=${userId}&exercise=${encodeURIComponent(exerciseName)}`
      : `/api/workouts/volume-comparison?userId=${userId}`;
    
    const response = await fetch(query);
    if (!response.ok) return 0;
    
    const data = await response.json();
    const previousVolume = data.previousVolume || 0;
    
    if (previousVolume === 0) return 0;
    return Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
  } catch (error) {
    console.error('Failed to fetch volume comparison:', error);
    return 0;
  }
}
