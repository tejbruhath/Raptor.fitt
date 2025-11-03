/**
 * Workout Recommendation Engine
 * Adaptive weight and volume suggestions based on progress and recovery
 */

interface ExerciseHistory {
  exercise: string;
  muscleGroup: string;
  sets: { reps: number; weight: number; rpe?: number }[];
  date: string;
}

interface Recommendation {
  exercise: string;
  muscleGroup: string;
  suggestedWeight: number;
  suggestedSets: number;
  suggestedReps: number;
  reasoning: string;
  confidence: number; // 0-100
}

interface WorkoutPlan {
  recommendations: Recommendation[];
  overallIntensity: 'light' | 'moderate' | 'heavy';
  expectedSIGain: number;
  deloadSuggested: boolean;
}

/**
 * Calculate progress rate from recent history
 */
function calculateProgressRate(history: ExerciseHistory[]): number {
  if (history.length < 2) return 0.025; // Default 2.5% increase
  
  const weights = history.map(h => {
    const maxWeight = Math.max(...h.sets.map(s => s.weight));
    return maxWeight;
  });
  
  // Calculate weekly progress rate
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const weeks = history.length / 3; // Assuming 3 workouts per week
  
  const progressRate = (lastWeight - firstWeight) / firstWeight / weeks;
  
  // Cap at reasonable values
  return Math.min(0.10, Math.max(0.01, progressRate)); // 1-10% per week
}

/**
 * Recommend next workout weight based on adaptive algorithm
 */
export function recommendNextWeight(
  exercise: string,
  history: ExerciseHistory[],
  fatigueFactor: number = 0.8,
  recoveryScore: number = 75
): Recommendation {
  if (history.length === 0) {
    return {
      exercise,
      muscleGroup: 'unknown',
      suggestedWeight: 20, // Start conservative
      suggestedSets: 3,
      suggestedReps: 10,
      reasoning: 'No history - starting with beginner weight',
      confidence: 50,
    };
  }
  
  // Get most recent workout
  const lastWorkout = history[history.length - 1];
  const lastMaxWeight = Math.max(...lastWorkout.sets.map(s => s.weight));
  const lastAvgReps = lastWorkout.sets.reduce((sum, s) => sum + s.reps, 0) / lastWorkout.sets.length;
  const lastAvgRPE = lastWorkout.sets
    .filter(s => s.rpe)
    .reduce((sum, s) => sum + (s.rpe || 7), 0) / (lastWorkout.sets.filter(s => s.rpe).length || 1);
  
  // Calculate progress rate
  const progressRate = calculateProgressRate(history);
  
  // Adaptive weight calculation
  // Formula: nextWeight = currentWeight + (progressRate * fatigueFactor * adjustment)
  let adjustment = 0.8; // Base adjustment
  
  // Adjust based on RPE (if tracked)
  if (lastAvgRPE < 7) {
    // Too easy - increase more
    adjustment = 1.2;
  } else if (lastAvgRPE > 9) {
    // Too hard - increase less or maintain
    adjustment = 0.3;
  }
  
  // Adjust based on recovery
  if (recoveryScore < 60) {
    adjustment *= 0.5; // Cut progression in half if poorly recovered
  }
  
  // Calculate suggested weight
  const weightIncrease = lastMaxWeight * progressRate * fatigueFactor * adjustment;
  const suggestedWeight = Math.round((lastMaxWeight + weightIncrease) * 2) / 2; // Round to nearest 0.5kg
  
  // Determine sets and reps
  let suggestedSets = lastWorkout.sets.length;
  let suggestedReps = Math.round(lastAvgReps);
  
  // Progressive overload: increase volume if weight is staying similar
  if (weightIncrease < lastMaxWeight * 0.02) {
    // Less than 2% increase - add volume instead
    if (lastAvgReps < 12) {
      suggestedReps += 1;
    } else if (suggestedSets < 5) {
      suggestedSets += 1;
      suggestedReps = Math.max(8, Math.round(lastAvgReps * 0.8));
    }
  }
  
  // Generate reasoning
  let reasoning = '';
  if (adjustment > 1.0) {
    reasoning = `Last session RPE ${lastAvgRPE.toFixed(1)} indicates room for growth. Progressive overload recommended.`;
  } else if (adjustment < 0.5) {
    reasoning = `Recovery score ${recoveryScore} suggests conservative progression. Focus on technique.`;
  } else {
    reasoning = `Standard progression based on ${(progressRate * 100).toFixed(1)}% weekly growth rate.`;
  }
  
  // Calculate confidence
  const historyConfidence = Math.min(100, (history.length / 10) * 100); // 10+ workouts = 100%
  const rpeConfidence = lastAvgRPE > 0 ? 100 : 70; // Higher if RPE tracked
  const confidence = Math.round((historyConfidence * 0.6 + rpeConfidence * 0.4));
  
  return {
    exercise,
    muscleGroup: lastWorkout.muscleGroup,
    suggestedWeight,
    suggestedSets,
    suggestedReps,
    reasoning,
    confidence,
  };
}

/**
 * Generate full workout plan recommendations
 */
export function generateWorkoutPlan(
  exerciseHistory: Map<string, ExerciseHistory[]>,
  currentSI: number,
  expectedSI: number,
  recoveryScore: number,
  muscleGroup?: string
): WorkoutPlan {
  const recommendations: Recommendation[] = [];
  const fatigueFactor = recoveryScore / 100;
  
  // Check if deload is needed
  const deloadSuggested = currentSI < expectedSI * 0.9; // More than 10% below expected
  
  // Determine overall intensity
  let overallIntensity: 'light' | 'moderate' | 'heavy' = 'moderate';
  if (deloadSuggested || recoveryScore < 60) {
    overallIntensity = 'light';
  } else if (recoveryScore > 80 && currentSI >= expectedSI) {
    overallIntensity = 'heavy';
  }
  
  // Generate recommendations for each exercise
  exerciseHistory.forEach((history, exercise) => {
    // Filter by muscle group if specified
    if (muscleGroup && history[0]?.muscleGroup !== muscleGroup) {
      return;
    }
    
    // Adjust fatigue factor for deload
    const adjustedFatigue = deloadSuggested ? fatigueFactor * 0.6 : fatigueFactor;
    
    const rec = recommendNextWeight(exercise, history, adjustedFatigue, recoveryScore);
    
    // Apply deload adjustments if needed
    if (deloadSuggested) {
      rec.suggestedWeight *= 0.7; // 70% of recommended weight
      rec.suggestedSets = Math.max(2, rec.suggestedSets - 1);
      rec.reasoning = `DELOAD WEEK: ${rec.reasoning} Reduced volume for recovery.`;
    }
    
    recommendations.push(rec);
  });
  
  // Calculate expected SI gain from this workout
  const avgWeightIncrease = recommendations.reduce((sum, rec) => {
    const history = exerciseHistory.get(rec.exercise) || [];
    const lastWeight = history.length > 0
      ? Math.max(...history[history.length - 1].sets.map(s => s.weight))
      : 0;
    return sum + (rec.suggestedWeight - lastWeight);
  }, 0) / (recommendations.length || 1);
  
  const expectedSIGain = avgWeightIncrease * 0.5; // Rough estimate
  
  return {
    recommendations,
    overallIntensity,
    expectedSIGain,
    deloadSuggested,
  };
}

/**
 * Analyze workout quality and provide feedback
 */
export function analyzeWorkoutQuality(
  planned: Recommendation,
  actual: { weight: number; reps: number; sets: number }
): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  feedback: string;
  adherence: number; // 0-100
} {
  const weightAdherence = Math.min(100, (actual.weight / planned.suggestedWeight) * 100);
  const volumeAdherence = Math.min(100, ((actual.sets * actual.reps) / (planned.suggestedSets * planned.suggestedReps)) * 100);
  const adherence = Math.round((weightAdherence * 0.6 + volumeAdherence * 0.4));
  
  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  let feedback: string;
  
  if (adherence >= 95) {
    quality = 'excellent';
    feedback = 'Perfect execution! Hitting all targets consistently.';
  } else if (adherence >= 85) {
    quality = 'good';
    feedback = 'Great work! Minor deviations are normal.';
  } else if (adherence >= 70) {
    quality = 'fair';
    feedback = 'Decent session. Consider adjusting targets if consistently missing.';
  } else {
    quality = 'poor';
    feedback = 'Significant gap from plan. May need to recalibrate targets or focus on recovery.';
  }
  
  return { quality, feedback, adherence };
}

/**
 * Suggest optimal rest days based on muscle group rotation
 */
export function suggestRestDays(
  recentWorkouts: { date: string; muscleGroups: string[] }[],
  targetFrequency: number = 4 // workouts per week
): {
  shouldRest: boolean;
  reason: string;
  nextWorkoutDate: string;
} {
  if (recentWorkouts.length === 0) {
    return {
      shouldRest: false,
      reason: 'No recent workouts',
      nextWorkoutDate: new Date().toISOString(),
    };
  }
  
  // Get last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const lastWeek = recentWorkouts.filter(w => new Date(w.date) >= weekAgo);
  
  // Count workouts this week
  const workoutsThisWeek = lastWeek.length;
  
  // Check if trained today
  const today = new Date().toDateString();
  const trainedToday = recentWorkouts.some(w => new Date(w.date).toDateString() === today);
  
  if (trainedToday) {
    return {
      shouldRest: true,
      reason: 'Already trained today',
      nextWorkoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }
  
  if (workoutsThisWeek >= targetFrequency) {
    return {
      shouldRest: true,
      reason: `Hit target frequency (${targetFrequency}/week)`,
      nextWorkoutDate: new Date(weekAgo.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
  
  // Check muscle group fatigue
  const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
  const hoursSinceLastWorkout = (Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastWorkout < 24) {
    return {
      shouldRest: true,
      reason: 'Less than 24h since last workout',
      nextWorkoutDate: new Date(new Date(lastWorkout.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }
  
  return {
    shouldRest: false,
    reason: 'Ready to train',
    nextWorkoutDate: new Date().toISOString(),
  };
}
