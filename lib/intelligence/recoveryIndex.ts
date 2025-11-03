/**
 * Recovery Index System
 * Tracks sleep, workout intensity, and muscle fatigue to calculate "Ready Score" (0-100)
 */

interface SleepData {
  date: string;
  hours: number;
  quality: number; // 1-5 scale
}

interface WorkoutIntensity {
  date: string;
  muscleGroups: string[];
  totalVolume: number;
  avgRPE: number;
  duration: number; // minutes
}

interface MuscleGroupFatigue {
  [muscleGroup: string]: {
    lastTrained: string;
    intensity: number; // 0-10
    recoveryDays: number;
  };
}

interface RecoveryScore {
  overall: number; // 0-100 "Ready Score"
  sleep: number; // 0-100
  intensity: number; // 0-100
  muscleFatigue: number; // 0-100
  recommendation: 'rest' | 'light' | 'moderate' | 'heavy';
  details: {
    sleepDeficit: number; // hours
    fatiguedMuscleGroups: string[];
    daysWithoutRest: number;
  };
}

/**
 * Calculate sleep recovery score
 * Target: 7-9 hours per night
 */
function calculateSleepScore(recentSleep: SleepData[]): { score: number; deficit: number } {
  if (recentSleep.length === 0) {
    return { score: 70, deficit: 0 }; // Assume average if no data
  }
  
  const last7Days = recentSleep.slice(-7);
  const avgHours = last7Days.reduce((sum, s) => sum + s.hours, 0) / last7Days.length;
  const avgQuality = last7Days.reduce((sum, s) => sum + s.quality, 0) / last7Days.length;
  
  // Target: 8 hours
  const targetHours = 8;
  const deficit = Math.max(0, targetHours - avgHours);
  
  // Calculate hour score (0-100)
  let hourScore = 100;
  if (avgHours < 6) {
    hourScore = 40; // Severely under-slept
  } else if (avgHours < 7) {
    hourScore = 65; // Under-slept
  } else if (avgHours >= 7 && avgHours <= 9) {
    hourScore = 100; // Optimal
  } else if (avgHours > 9) {
    hourScore = 85; // Slightly oversleeping
  }
  
  // Quality adjustment (1-5 scale -> 60-100 score)
  const qualityScore = 60 + (avgQuality / 5) * 40;
  
  // Weighted combination
  const score = Math.round(hourScore * 0.7 + qualityScore * 0.3);
  
  return { score, deficit: deficit * last7Days.length }; // Total deficit over week
}

/**
 * Calculate workout intensity recovery score
 * High frequency + high intensity = lower recovery
 */
function calculateIntensityScore(recentWorkouts: WorkoutIntensity[]): number {
  if (recentWorkouts.length === 0) {
    return 100; // Fully recovered if no workouts
  }
  
  const last7Days = recentWorkouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  });
  
  if (last7Days.length === 0) {
    return 100; // No workouts in last week
  }
  
  // Calculate training load
  const workoutCount = last7Days.length;
  const avgRPE = last7Days.reduce((sum, w) => sum + w.avgRPE, 0) / workoutCount;
  const totalVolume = last7Days.reduce((sum, w) => sum + w.totalVolume, 0);
  const avgDuration = last7Days.reduce((sum, w) => sum + w.duration, 0) / workoutCount;
  
  // Frequency penalty (4-5/week = optimal, >5 = fatigue)
  let frequencyScore = 100;
  if (workoutCount >= 6) {
    frequencyScore = 60; // High frequency
  } else if (workoutCount === 5) {
    frequencyScore = 85;
  } else if (workoutCount <= 2) {
    frequencyScore = 90; // Low frequency, likely recovered
  }
  
  // Intensity penalty (RPE 7-8 = optimal, >8 = fatigue)
  let intensityScore = 100;
  if (avgRPE >= 9) {
    intensityScore = 50; // Very high intensity
  } else if (avgRPE >= 8) {
    intensityScore = 70;
  } else if (avgRPE < 6) {
    intensityScore = 95; // Light training
  }
  
  // Duration penalty (60-90 min = optimal, >120 = fatigue)
  let durationScore = 100;
  if (avgDuration > 120) {
    durationScore = 60; // Very long sessions
  } else if (avgDuration > 90) {
    durationScore = 80;
  }
  
  // Weighted combination
  return Math.round(frequencyScore * 0.4 + intensityScore * 0.4 + durationScore * 0.2);
}

/**
 * Calculate muscle group fatigue scores
 * Considers recovery time needed per muscle group
 */
function calculateMuscleFatigueScore(recentWorkouts: WorkoutIntensity[]): {
  score: number;
  fatigue: MuscleGroupFatigue;
  fatigued: string[];
} {
  const muscleRecoveryTime: { [key: string]: number } = {
    chest: 48,
    back: 48,
    shoulders: 48,
    arms: 36,
    legs: 72, // Legs need more recovery
    core: 24,
  };
  
  const muscleFatigue: MuscleGroupFatigue = {};
  const now = Date.now();
  
  // Track last training for each muscle group
  recentWorkouts.forEach(workout => {
    workout.muscleGroups.forEach(mg => {
      const workoutTime = new Date(workout.date).getTime();
      const hoursSince = (now - workoutTime) / (1000 * 60 * 60);
      const daysSince = hoursSince / 24;
      
      if (!muscleFatigue[mg] || new Date(workout.date) > new Date(muscleFatigue[mg].lastTrained)) {
        muscleFatigue[mg] = {
          lastTrained: workout.date,
          intensity: workout.avgRPE,
          recoveryDays: daysSince,
        };
      }
    });
  });
  
  // Calculate score for each muscle group
  const muscleScores: number[] = [];
  const fatigued: string[] = [];
  
  Object.entries(muscleFatigue).forEach(([muscle, data]) => {
    const requiredRecovery = muscleRecoveryTime[muscle] || 48;
    const recoveryHours = data.recoveryDays * 24;
    
    if (recoveryHours >= requiredRecovery) {
      muscleScores.push(100); // Fully recovered
    } else {
      const recoveryPercent = (recoveryHours / requiredRecovery) * 100;
      muscleScores.push(recoveryPercent);
      
      if (recoveryPercent < 75) {
        fatigued.push(muscle);
      }
    }
  });
  
  const avgScore = muscleScores.length > 0
    ? muscleScores.reduce((sum, s) => sum + s, 0) / muscleScores.length
    : 100;
  
  return {
    score: Math.round(avgScore),
    fatigue: muscleFatigue,
    fatigued,
  };
}

/**
 * Calculate overall recovery score (Ready Score)
 */
export function calculateRecoveryScore(
  recentSleep: SleepData[],
  recentWorkouts: WorkoutIntensity[]
): RecoveryScore {
  // Calculate individual components
  const { score: sleepScore, deficit: sleepDeficit } = calculateSleepScore(recentSleep);
  const intensityScore = calculateIntensityScore(recentWorkouts);
  const { score: muscleFatigueScore, fatigued: fatiguedMuscleGroups } = calculateMuscleFatigueScore(recentWorkouts);
  
  // Calculate days without rest
  let daysWithoutRest = 0;
  const sortedWorkouts = [...recentWorkouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  for (const workout of sortedWorkouts) {
    const workoutDate = new Date(workout.date);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === daysWithoutRest) {
      daysWithoutRest++;
    } else {
      break;
    }
  }
  
  // Weighted overall score
  // Sleep: 35%, Intensity: 35%, Muscle Fatigue: 30%
  const overall = Math.round(
    sleepScore * 0.35 +
    intensityScore * 0.35 +
    muscleFatigueScore * 0.30
  );
  
  // Determine recommendation
  let recommendation: 'rest' | 'light' | 'moderate' | 'heavy';
  if (overall < 50) {
    recommendation = 'rest';
  } else if (overall < 65) {
    recommendation = 'light';
  } else if (overall < 80) {
    recommendation = 'moderate';
  } else {
    recommendation = 'heavy';
  }
  
  // Override: force rest if 6+ consecutive days
  if (daysWithoutRest >= 6) {
    recommendation = 'rest';
  }
  
  return {
    overall,
    sleep: sleepScore,
    intensity: intensityScore,
    muscleFatigue: muscleFatigueScore,
    recommendation,
    details: {
      sleepDeficit,
      fatiguedMuscleGroups,
      daysWithoutRest,
    },
  };
}

/**
 * Generate recovery advice based on score
 */
export function getRecoveryAdvice(score: RecoveryScore): string[] {
  const advice: string[] = [];
  
  // Sleep advice
  if (score.sleep < 70) {
    advice.push(`🛌 Sleep: You need ${score.details.sleepDeficit.toFixed(1)} more hours this week. Aim for 7-9 hours/night.`);
  }
  
  // Intensity advice
  if (score.intensity < 70) {
    advice.push(`⚡ Intensity: Training load is high. Consider reducing RPE or taking an extra rest day.`);
  }
  
  // Muscle fatigue advice
  if (score.muscleFatigue < 70 && score.details.fatiguedMuscleGroups.length > 0) {
    advice.push(`💪 Fatigue: ${score.details.fatiguedMuscleGroups.join(', ')} need more recovery. Avoid training these today.`);
  }
  
  // Consecutive days advice
  if (score.details.daysWithoutRest >= 5) {
    advice.push(`🚨 Warning: ${score.details.daysWithoutRest} consecutive training days. Rest day is MANDATORY.`);
  }
  
  // Positive feedback
  if (score.overall >= 80) {
    advice.push(`✅ You're fully recovered! This is a great day for a high-intensity session.`);
  }
  
  return advice;
}

/**
 * Predict recovery time for a planned workout
 */
export function predictRecoveryTime(
  plannedMuscleGroups: string[],
  plannedIntensity: number // RPE 1-10
): {
  recoveryDays: number;
  readyByDate: string;
} {
  const muscleRecoveryTime: { [key: string]: number } = {
    chest: 48,
    back: 48,
    shoulders: 48,
    arms: 36,
    legs: 72,
    core: 24,
  };
  
  // Get max recovery time needed
  const maxRecovery = plannedMuscleGroups.reduce((max, mg) => {
    const baseRecovery = muscleRecoveryTime[mg] || 48;
    // High intensity adds 20% more recovery time
    const adjusted = plannedIntensity >= 8 ? baseRecovery * 1.2 : baseRecovery;
    return Math.max(max, adjusted);
  }, 0);
  
  const recoveryDays = Math.ceil(maxRecovery / 24);
  const readyByDate = new Date(Date.now() + maxRecovery * 60 * 60 * 1000);
  
  return {
    recoveryDays,
    readyByDate: readyByDate.toISOString(),
  };
}
