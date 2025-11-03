/**
 * Enhanced Growth Prediction System
 * Compares Expected (Predicted) vs Observed vs Future Growth
 * Based on natural progression rates and 1RM estimation
 */

interface Exercise1RMData {
  date: Date;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
}

interface GrowthRateConfig {
  weeklyGrowthRate: number;  // e.g., 0.015 for 1.5%
  naturalMax: number;         // Natural ceiling for this lift
}

// Growth rates for different exercises (weekly %)
const EXERCISE_GROWTH_RATES: Record<string, GrowthRateConfig> = {
  'bench press': { weeklyGrowthRate: 0.015, naturalMax: 160 },
  'barbell bench press': { weeklyGrowthRate: 0.015, naturalMax: 160 },
  'squat': { weeklyGrowthRate: 0.018, naturalMax: 220 },
  'barbell squat': { weeklyGrowthRate: 0.018, naturalMax: 220 },
  'deadlift': { weeklyGrowthRate: 0.012, naturalMax: 260 },
  'barbell deadlift': { weeklyGrowthRate: 0.012, naturalMax: 260 },
  'overhead press': { weeklyGrowthRate: 0.010, naturalMax: 90 },
  'military press': { weeklyGrowthRate: 0.010, naturalMax: 90 },
  'barbell row': { weeklyGrowthRate: 0.012, naturalMax: 140 },
  'pendlay row': { weeklyGrowthRate: 0.012, naturalMax: 140 },
};

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight × (1 + reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Calculate expected 1RM at time t using logarithmic growth model
 * Expected_1RM_t = Base_1RM + (Base_1RM × GrowthRate × log(t + 1))
 * 
 * @param base1RM - Starting 1RM
 * @param weekNumber - Week number since training started
 * @param growthRate - Weekly growth rate (e.g., 0.015 for 1.5%)
 * @returns Expected 1RM at week t
 */
export function calculateExpected1RM(
  base1RM: number,
  weekNumber: number,
  growthRate: number
): number {
  // Logarithmic growth model (diminishing returns)
  const growth = base1RM * growthRate * Math.log(weekNumber + 1);
  return base1RM + growth;
}

/**
 * Calculate Growth Ratio: Observed / Expected
 * Interpretation:
 * < 0.9: Lagging
 * 0.9-1.1: On Track
 * > 1.1: Exceeding
 */
export function calculateGrowthRatio(observed1RM: number, expected1RM: number): {
  ratio: number;
  status: 'lagging' | 'on-track' | 'exceeding';
  label: string;
} {
  const ratio = observed1RM / expected1RM;
  
  let status: 'lagging' | 'on-track' | 'exceeding' = 'on-track';
  let label = 'Progressing normally';
  
  if (ratio < 0.9) {
    status = 'lagging';
    label = 'Falling behind expected progression';
  } else if (ratio > 1.1) {
    status = 'exceeding';
    label = 'Beating expected growth';
  }
  
  return { ratio, status, label };
}

/**
 * Calculate SI adjustment based on growth ratio
 * ΔSI = (GR - 1) × 5
 */
export function calculateSIAdjustment(growthRatio: number): {
  delta: number;
  description: string;
} {
  const delta = (growthRatio - 1) * 5;
  
  let description = 'Normal progression';
  if (delta > 0.5) description = 'Excellent progress - bonus SI';
  else if (delta < -0.5) description = 'Below expectations - SI reduced';
  
  return { delta, description };
}

/**
 * Generate complete growth prediction for an exercise
 */
export function generateExerciseGrowthPrediction(
  exerciseName: string,
  workoutHistory: Exercise1RMData[],
  futureDays: number = 30
): {
  exerciseName: string;
  predicted: { date: Date; value: number }[];
  observed: { date: Date; value: number }[];
  future: { date: Date; value: number }[];
  growthRatio: ReturnType<typeof calculateGrowthRatio>;
  currentStatus: string;
  nextWeekTarget: number;
} | null {
  const normalized = exerciseName.toLowerCase().trim();
  const config = EXERCISE_GROWTH_RATES[normalized];
  
  if (!config || workoutHistory.length === 0) return null;
  
  // Sort by date
  const sorted = [...workoutHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const base1RM = sorted[0].estimated1RM;
  const startDate = sorted[0].date;
  
  // Generate predicted curve for all observed dates
  const predicted: { date: Date; value: number }[] = [];
  const observed: { date: Date; value: number }[] = [];
  
  sorted.forEach((point) => {
    const daysSinceStart = (point.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const weekNumber = daysSinceStart / 7;
    
    const expected1RM = calculateExpected1RM(base1RM, weekNumber, config.weeklyGrowthRate);
    
    predicted.push({ date: point.date, value: expected1RM });
    observed.push({ date: point.date, value: point.estimated1RM });
  });
  
  // Calculate growth ratio for latest data point
  const latestObserved = observed[observed.length - 1].value;
  const latestPredicted = predicted[predicted.length - 1].value;
  const growthRatio = calculateGrowthRatio(latestObserved, latestPredicted);
  
  // Generate future projection
  const lastDate = sorted[sorted.length - 1].date;
  const daysSinceStart = (lastDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const currentWeek = daysSinceStart / 7;
  
  const future: { date: Date; value: number }[] = [];
  
  for (let day = 1; day <= futureDays; day++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + day);
    
    const futureWeek = currentWeek + (day / 7);
    const futureExpected = calculateExpected1RM(base1RM, futureWeek, config.weeklyGrowthRate);
    
    // Adjust future projection based on current growth ratio
    const adjustedFuture = futureExpected * Math.min(growthRatio.ratio, 1.1);
    
    future.push({ date: futureDate, value: Math.min(adjustedFuture, config.naturalMax) });
  }
  
  // Predict next week's target
  const oneWeekFuture = future[7] || future[future.length - 1];
  const nextWeekTarget = oneWeekFuture ? oneWeekFuture.value : latestObserved * 1.01;
  
  // Current status message
  let currentStatus = growthRatio.label;
  if (growthRatio.ratio > 1.05) {
    currentStatus += ` (+${((growthRatio.ratio - 1) * 100).toFixed(1)}% ahead)`;
  } else if (growthRatio.ratio < 0.95) {
    currentStatus += ` (${((1 - growthRatio.ratio) * 100).toFixed(1)}% behind)`;
  }
  
  return {
    exerciseName,
    predicted,
    observed,
    future,
    growthRatio,
    currentStatus,
    nextWeekTarget,
  };
}

/**
 * Calculate overall Strength Index growth prediction
 * Combines all tracked exercises into aggregate SI prediction
 */
export function generateSIGrowthPrediction(
  siHistory: { date: Date; totalSI: number }[],
  futureDays: number = 30
): {
  predicted: { date: Date; value: number }[];
  observed: { date: Date; value: number }[];
  future: { date: Date; value: number }[];
  averageWeeklyGrowth: number;
  projectedSI30Days: number;
  projectedSI: number;
} {
  if (siHistory.length < 2) {
    return {
      predicted: [],
      observed: [],
      future: [],
      averageWeeklyGrowth: 0,
      projectedSI30Days: 50,
      projectedSI: 50,
    };
  }
  
  // Sort by date
  const sorted = [...siHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate average weekly growth rate from actual data
  const firstSI = sorted[0].totalSI;
  const lastSI = sorted[sorted.length - 1].totalSI;
  const daysBetween = (sorted[sorted.length - 1].date.getTime() - sorted[0].date.getTime()) / (1000 * 60 * 60 * 24);
  const weeksBetween = daysBetween / 7;
  
  const averageWeeklyGrowth = weeksBetween > 0 ? (lastSI - firstSI) / weeksBetween : 0;
  
  // Use logarithmic model for expected growth
  // SI growth typically follows 1-2% per week for naturals
  const baseGrowthRate = 0.015; // 1.5% per week
  const baseSI = sorted[0].totalSI;
  const startDate = sorted[0].date;
  
  // Generate predicted curve
  const predicted: { date: Date; value: number }[] = [];
  const observed: { date: Date; value: number }[] = [];
  
  sorted.forEach((point) => {
    const daysSinceStart = (point.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const weekNumber = daysSinceStart / 7;
    
    // Expected SI using logarithmic growth
    const expectedSI = baseSI + (baseSI * baseGrowthRate * Math.log(weekNumber + 1));
    
    predicted.push({ date: point.date, value: Math.min(expectedSI, 250) });
    observed.push({ date: point.date, value: point.totalSI });
  });
  
  // Generate future projection
  const lastDate = sorted[sorted.length - 1].date;
  const daysSinceStart = (lastDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const currentWeek = daysSinceStart / 7;
  
  const future: { date: Date; value: number }[] = [];
  
  for (let day = 1; day <= futureDays; day++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + day);
    
    const futureWeek = currentWeek + (day / 7);
    const futureExpected = baseSI + (baseSI * baseGrowthRate * Math.log(futureWeek + 1));
    
    // Cap at 250 (elite natural ceiling)
    future.push({ date: futureDate, value: Math.min(futureExpected, 250) });
  }
  
  const projectedSIFuture = future[future.length - 1]?.value || lastSI;
  
  return {
    predicted,
    observed,
    future,
    averageWeeklyGrowth,
    projectedSI30Days: projectedSIFuture,
    projectedSI: projectedSIFuture, // Alias for consistency
  };
}
