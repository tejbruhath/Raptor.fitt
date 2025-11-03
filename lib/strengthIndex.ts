import { IWorkout, IExercise } from './models/Workout';
import { calculate1RM } from './utils';

// Muscle group weights for SI calculation
const MUSCLE_GROUP_WEIGHTS = {
  chest: 1.0,
  back: 1.0,
  legs: 1.2, // Legs weighted higher
  shoulders: 0.8,
  arms: 0.7,
  core: 0.6,
};

// Exercise to muscle group mapping
const EXERCISE_MUSCLE_MAP: Record<string, keyof typeof MUSCLE_GROUP_WEIGHTS> = {
  // Chest
  'bench press': 'chest',
  'incline bench press': 'chest',
  'dumbbell press': 'chest',
  'push up': 'chest',
  'chest fly': 'chest',
  
  // Back
  'deadlift': 'back',
  'pull up': 'back',
  'chin up': 'back',
  'barbell row': 'back',
  'lat pulldown': 'back',
  'cable row': 'back',
  
  // Legs
  'squat': 'legs',
  'front squat': 'legs',
  'leg press': 'legs',
  'romanian deadlift': 'legs',
  'leg curl': 'legs',
  'leg extension': 'legs',
  'calf raise': 'legs',
  
  // Shoulders
  'overhead press': 'shoulders',
  'military press': 'shoulders',
  'shoulder press': 'shoulders',
  'lateral raise': 'shoulders',
  'front raise': 'shoulders',
  
  // Arms
  'bicep curl': 'arms',
  'hammer curl': 'arms',
  'tricep extension': 'arms',
  'tricep pushdown': 'arms',
  'close grip bench': 'arms',
};

interface StrengthBreakdown {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
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
  };

  // Get best lifts per muscle group
  const bestLifts: Record<string, { weight: number; reps: number; exerciseName: string }> = {};

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const muscleGroup = getMuscleGroup(exercise.name);
      const key = `${muscleGroup}-${exercise.name.toLowerCase()}`;

      exercise.sets.forEach((set) => {
        const estimated1RM = calculate1RM(set.weight, set.reps);
        
        if (!bestLifts[key] || estimated1RM > calculate1RM(bestLifts[key].weight, bestLifts[key].reps)) {
          bestLifts[key] = {
            weight: set.weight,
            reps: set.reps,
            exerciseName: exercise.name,
          };
        }
      });
    });
  });

  // Calculate SI for each muscle group
  Object.entries(bestLifts).forEach(([key, lift]) => {
    const muscleGroup = key.split('-')[0] as keyof StrengthBreakdown;
    const estimated1RM = calculate1RM(lift.weight, lift.reps);
    const normalized = (estimated1RM / bodyweight) * (MUSCLE_GROUP_WEIGHTS[muscleGroup] || 1);
    
    breakdown[muscleGroup] += normalized;
  });

  // Calculate total SI
  const totalSI = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    totalSI: Math.round(totalSI * 10) / 10,
    breakdown: {
      chest: Math.round(breakdown.chest * 10) / 10,
      back: Math.round(breakdown.back * 10) / 10,
      legs: Math.round(breakdown.legs * 10) / 10,
      shoulders: Math.round(breakdown.shoulders * 10) / 10,
      arms: Math.round(breakdown.arms * 10) / 10,
    },
  };
}

function getMuscleGroup(exerciseName: string): keyof typeof MUSCLE_GROUP_WEIGHTS {
  const normalized = exerciseName.toLowerCase().trim();
  return EXERCISE_MUSCLE_MAP[normalized] || 'chest';
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
