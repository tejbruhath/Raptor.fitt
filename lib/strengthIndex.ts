import { IWorkout } from './models/Workout';

// Strength Index System: 50 (beginner) → 250 (elite natural)
// SI is based ONLY on weight lifted, not reps or volume

interface ExerciseDefinition {
  naturalMax: number;  // Natural max weight for this exercise (kg)
  maxSI: number;       // Max SI contribution
  startWeight: number; // Weight where SI starts counting
  increment: number;   // Weight increment per SI point
}

// COMPOUND LIFTS (Total: 170 SI)
const COMPOUND_EXERCISES: Record<string, ExerciseDefinition> = {
  'bench press': {
    naturalMax: 160,
    maxSI: 40,
    startWeight: 60,
    increment: 4,  // +1 SI per 4kg over 60kg
  },
  'barbell bench press': {
    naturalMax: 160,
    maxSI: 40,
    startWeight: 60,
    increment: 4,
  },
  'squat': {
    naturalMax: 220,
    maxSI: 40,
    startWeight: 80,
    increment: 5,  // +1 SI per 5kg over 80kg
  },
  'barbell squat': {
    naturalMax: 220,
    maxSI: 40,
    startWeight: 80,
    increment: 5,
  },
  'high bar squat': {
    naturalMax: 220,
    maxSI: 40,
    startWeight: 80,
    increment: 5,
  },
  'deadlift': {
    naturalMax: 260,
    maxSI: 40,
    startWeight: 100,
    increment: 5,  // +1 SI per 5kg over 100kg
  },
  'barbell deadlift': {
    naturalMax: 260,
    maxSI: 40,
    startWeight: 100,
    increment: 5,
  },
  'overhead press': {
    naturalMax: 90,
    maxSI: 25,
    startWeight: 50,
    increment: 1.6,  // +1 SI per 1.6kg over 50kg
  },
  'military press': {
    naturalMax: 90,
    maxSI: 25,
    startWeight: 50,
    increment: 1.6,
  },
  'shoulder press': {
    naturalMax: 90,
    maxSI: 25,
    startWeight: 50,
    increment: 1.6,
  },
  'barbell row': {
    naturalMax: 140,
    maxSI: 25,
    startWeight: 50,
    increment: 3.6,  // +1 SI per 3.6kg over 50kg
  },
  'pendlay row': {
    naturalMax: 140,
    maxSI: 25,
    startWeight: 50,
    increment: 3.6,
  },
};

// SECONDARY/ISOLATION LIFTS (Total: 60 SI)
const SECONDARY_EXERCISES: Record<string, ExerciseDefinition> = {
  'incline bench press': {
    naturalMax: 120,
    maxSI: 10,
    startWeight: 50,
    increment: 7,  // +1 SI per 7kg over 50kg
  },
  'incline bench': {
    naturalMax: 120,
    maxSI: 10,
    startWeight: 50,
    increment: 7,
  },
  'front squat': {
    naturalMax: 180,
    maxSI: 10,
    startWeight: 50,
    increment: 13,  // +1 SI per 13kg over 50kg
  },
  'leg press': {
    naturalMax: 300,  // Adjusted for leg press
    maxSI: 10,
    startWeight: 100,
    increment: 20,
  },
  'bicep curl': {
    naturalMax: 60,
    maxSI: 10,
    startWeight: 40,
    increment: 2,  // +1 SI per 2kg over 40kg
  },
  'barbell curl': {
    naturalMax: 60,
    maxSI: 10,
    startWeight: 40,
    increment: 2,
  },
  'skull crusher': {
    naturalMax: 80,
    maxSI: 10,
    startWeight: 50,
    increment: 3,  // +1 SI per 3kg over 50kg
  },
  'skull crushers': {
    naturalMax: 80,
    maxSI: 10,
    startWeight: 50,
    increment: 3,
  },
  'close grip bench': {
    naturalMax: 80,
    maxSI: 10,
    startWeight: 50,
    increment: 3,
  },
  'close grip bench press': {
    naturalMax: 80,
    maxSI: 10,
    startWeight: 50,
    increment: 3,
  },
  'pull up': {
    naturalMax: 50,  // BW + 50kg
    maxSI: 10,
    startWeight: 0,
    increment: 5,  // +1 SI per +5kg
  },
  'weighted pull up': {
    naturalMax: 50,
    maxSI: 10,
    startWeight: 0,
    increment: 5,
  },
  'lat pulldown': {
    naturalMax: 100,
    maxSI: 10,
    startWeight: 50,
    increment: 5,  // +1 SI per 5kg over 50kg
  },
  'cable row': {
    naturalMax: 100,
    maxSI: 10,
    startWeight: 50,
    increment: 5,
  },
};

// ATHLETIC/FUNCTIONAL (Optional 20 SI buffer)
const ATHLETIC_EXERCISES: Record<string, ExerciseDefinition> = {
  'dip': {
    naturalMax: 50,  // BW + 50kg
    maxSI: 5,
    startWeight: 0,
    increment: 10,
  },
  'weighted dip': {
    naturalMax: 50,
    maxSI: 5,
    startWeight: 0,
    increment: 10,
  },
};

// Combine all exercises
const ALL_EXERCISES = {
  ...COMPOUND_EXERCISES,
  ...SECONDARY_EXERCISES,
  ...ATHLETIC_EXERCISES,
};

interface StrengthBreakdown {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
  core: number;
}

// Calculate SI for a single exercise based on max weight lifted
function calculateExerciseSI(exerciseName: string, maxWeight: number): number {
  const normalized = exerciseName.toLowerCase().trim();
  const exerciseDef = ALL_EXERCISES[normalized];

  if (!exerciseDef) {
    return 0;  // Exercise not in SI system
  }

  // If weight is below start threshold, return 0
  if (maxWeight <= exerciseDef.startWeight) {
    return 0;
  }

  // Calculate SI based on weight progress
  const weightProgress = maxWeight - exerciseDef.startWeight;
  const siEarned = weightProgress / exerciseDef.increment;

  // Cap at max SI for this exercise
  return Math.min(siEarned, exerciseDef.maxSI);
}

// Get muscle group for an exercise
function getMuscleGroup(exerciseName: string): keyof StrengthBreakdown {
  const normalized = exerciseName.toLowerCase().trim();
  
  // Chest exercises
  if (normalized.includes('bench') || normalized.includes('chest') || 
      normalized.includes('dip') || normalized.includes('push up')) {
    return 'chest';
  }
  
  // Back exercises
  if (normalized.includes('deadlift') || normalized.includes('row') || 
      normalized.includes('pull') || normalized.includes('lat')) {
    return 'back';
  }
  
  // Leg exercises
  if (normalized.includes('squat') || normalized.includes('leg') || 
      normalized.includes('lunge')) {
    return 'legs';
  }
  
  // Shoulder exercises
  if (normalized.includes('overhead') || normalized.includes('military') ||
      normalized.includes('shoulder') || normalized.includes('press') && 
      !normalized.includes('bench') && !normalized.includes('leg')) {
    return 'shoulders';
  }
  
  // Arm exercises
  if (normalized.includes('curl') || normalized.includes('tricep') || 
      normalized.includes('skull')) {
    return 'arms';
  }
  
  return 'chest';  // Default
}

export function calculateStrengthIndex(
  workouts: IWorkout[],
  bodyweight: number
): { totalSI: number; breakdown: StrengthBreakdown } {
  const breakdown: StrengthBreakdown = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
  };

  // BASE SI: Everyone starts at 50
  let baseSI = 50;

  // Track max weight per exercise (not 1RM, just actual max weight lifted)
  const maxWeights: Record<string, number> = {};

  // Find max weight for each exercise across all workouts
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const normalized = exercise.name.toLowerCase().trim();
      
      exercise.sets.forEach((set) => {
        // Only track the weight, ignore reps
        if (!maxWeights[normalized] || set.weight > maxWeights[normalized]) {
          maxWeights[normalized] = set.weight;
        }
      });
    });
  });

  // Calculate SI for each exercise
  let earnedSI = 0;
  Object.entries(maxWeights).forEach(([exerciseName, maxWeight]) => {
    const exerciseSI = calculateExerciseSI(exerciseName, maxWeight);
    
    if (exerciseSI > 0) {
      const muscleGroup = getMuscleGroup(exerciseName);
      breakdown[muscleGroup] += exerciseSI;
      earnedSI += exerciseSI;
    }
  });

  // Total SI = Base (50) + Earned SI, capped at 250
  const totalSI = Math.min(baseSI + earnedSI, 250);

  return {
    totalSI: Math.round(totalSI * 10) / 10,
    breakdown: {
      chest: Math.round(breakdown.chest * 10) / 10,
      back: Math.round(breakdown.back * 10) / 10,
      legs: Math.round(breakdown.legs * 10) / 10,
      shoulders: Math.round(breakdown.shoulders * 10) / 10,
      arms: Math.round(breakdown.arms * 10) / 10,
      core: Math.round(breakdown.core * 10) / 10,
    },
  };
}

// Get strength tier label
export function getStrengthTier(si: number): string {
  if (si < 100) return 'Novice';
  if (si < 150) return 'Intermediate';
  if (si < 200) return 'Advanced';
  return 'Elite Natural';
}

export function calculateFatigueAdjustment(
  sleepHours: number,
  sleepQuality: number,
  soreness: number,
  stress: number
): number {
  // Ideal values
  const idealSleep = 8;
  const idealQuality = 8;
  const idealSoreness = 3;
  const idealStress = 3;

  // Calculate deviations
  const sleepFactor = Math.max(0, 1 - Math.abs(sleepHours - idealSleep) / idealSleep);
  const qualityFactor = sleepQuality / 10;
  const sorenessFactor = 1 - (soreness / 10);
  const stressFactor = 1 - (stress / 10);

  // Weighted average (sleep is most important)
  const adjustment = (
    sleepFactor * 0.35 +
    qualityFactor * 0.25 +
    sorenessFactor * 0.20 +
    stressFactor * 0.20
  );

  return Math.max(0.5, Math.min(1.0, adjustment)); // Clamp between 0.5 and 1.0
}

export function predictGrowthCurve(
  historicalSI: { date: Date; value: number }[],
  daysAhead: number = 30
): { date: Date; predicted: number }[] {
  if (historicalSI.length < 2) return [];

  // Simple linear regression
  const n = historicalSI.length;
  const xValues = historicalSI.map((_, i) => i);
  const yValues = historicalSI.map((d) => d.value);

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate predictions
  const predictions: { date: Date; predicted: number }[] = [];
  const lastDate = historicalSI[historicalSI.length - 1].date;

  for (let i = 1; i <= daysAhead; i++) {
    const predictedValue = slope * (n + i - 1) + intercept;
    const predictedDate = new Date(lastDate);
    predictedDate.setDate(predictedDate.getDate() + i);

    predictions.push({
      date: predictedDate,
      predicted: Math.max(0, predictedValue),
    });
  }

  return predictions;
}
