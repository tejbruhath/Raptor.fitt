import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import Recovery from '@/lib/models/Recovery';
import { recommendNextWeight } from '@/lib/intelligence/recommendationEngine';
import { calculateRecoveryScore } from '@/lib/intelligence/recoveryIndex';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workouts, recovery] = await Promise.all([
      Workout.find({ userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }),
      Recovery.find({ userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }),
    ]);

    // Calculate weekly volume trend
    const weeklyVolumes = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekWorkouts = workouts.filter(w => {
        const date = new Date(w.date);
        return date >= weekStart && date < weekEnd;
      });

      const volume = weekWorkouts.reduce((sum, w) => {
        return sum + w.exercises.reduce((exSum: number, ex: any) => {
          return exSum + ex.sets.reduce((setSum: number, set: any) => {
            return setSum + set.reps * set.weight;
          }, 0);
        }, 0);
      }, 0);

      weeklyVolumes.push(volume);
    }

    // Check for deload need
    const volumeTrend = weeklyVolumes[0] - weeklyVolumes[weeklyVolumes.length - 1];
    const avgVolume = weeklyVolumes.reduce((a, b) => a + b, 0) / weeklyVolumes.length;
    const isHighVolume = weeklyVolumes[0] > avgVolume * 1.2;

    // Check recovery
    const recentRecovery = recovery.slice(0, 7);
    const avgSleep = recentRecovery.length > 0
      ? recentRecovery.reduce((sum, r) => sum + r.sleepHours, 0) / recentRecovery.length
      : 7;
    const avgSoreness = recentRecovery.length > 0
      ? recentRecovery.reduce((sum, r) => sum + r.soreness, 0) / recentRecovery.length
      : 5;

    const needsDeload = (
      (avgSoreness > 7 && avgSleep < 6.5) ||
      (isHighVolume && avgSoreness > 6) ||
      volumeTrend > avgVolume * 0.5
    );

    // Generate exercise-specific recommendations
    const exerciseRecommendations: any[] = [];
    
    // Get last workout
    if (workouts.length > 0) {
      const lastWorkout = workouts[0];
      
      for (const exercise of lastWorkout.exercises) {
        // Find previous sessions of same exercise
        const previousSessions = workouts
          .filter(w => w._id !== lastWorkout._id)
          .map(w => w.exercises.find((ex: any) => ex.name === exercise.name))
          .filter(Boolean)
          .slice(0, 3);

        if (previousSessions.length > 0) {
          const lastSession = exercise;
          const prevSession = previousSessions[0];

          // Get heaviest set
          const lastHeaviest = lastSession.sets.reduce((max: any, set: any) => 
            set.weight > max.weight ? set : max
          );
          const prevHeaviest = prevSession.sets.reduce((max: any, set: any) => 
            set.weight > max.weight ? set : max
          );

          // Calculate recommendation
          const avgRPE = lastSession.sets.reduce((sum: number, set: any) => sum + (set.rpe || 7), 0) / lastSession.sets.length;

          let recommendation = "";
          let suggestedWeight = lastHeaviest.weight;
          let suggestedReps = lastHeaviest.reps;

          if (avgRPE < 7) {
            // Can increase weight
            suggestedWeight = Math.round((lastHeaviest.weight * 1.025) / 2.5) * 2.5;
            recommendation = "Increase weight - previous RPE was low";
          } else if (avgRPE > 9) {
            // Decrease weight or reps
            suggestedWeight = Math.round((lastHeaviest.weight * 0.95) / 2.5) * 2.5;
            recommendation = "Reduce weight - previous RPE was very high";
          } else if (lastHeaviest.weight === prevHeaviest.weight && lastHeaviest.reps === prevHeaviest.reps) {
            // Stagnant - try to progress
            suggestedReps = lastHeaviest.reps + 1;
            recommendation = "Add 1 rep - maintain progressive overload";
          } else if (lastHeaviest.weight > prevHeaviest.weight) {
            // Already progressing
            recommendation = "Keep current weight - good progress";
          } else {
            // Standard progression
            suggestedWeight = Math.round((lastHeaviest.weight * 1.025) / 2.5) * 2.5;
            recommendation = "Standard 2.5% increase";
          }

          exerciseRecommendations.push({
            exercise: exercise.name,
            muscleGroup: exercise.muscleGroup,
            lastWeight: lastHeaviest.weight,
            lastReps: lastHeaviest.reps,
            lastRPE: Math.round(avgRPE * 10) / 10,
            suggestedWeight,
            suggestedReps,
            recommendation,
          });
        }
      }
    }

    // General recommendations
    const recommendations = [];

    if (needsDeload) {
      recommendations.push({
        type: "deload",
        priority: "high",
        title: "Deload Week Recommended",
        description: `High soreness (${Math.round(avgSoreness)}/10) and/or increasing volume. Reduce weight by 30-40% this week.`,
        action: "Reduce volume by 40%"
      });
    }

    if (avgSleep < 7) {
      recommendations.push({
        type: "recovery",
        priority: "medium",
        title: "Improve Sleep",
        description: `Average sleep: ${Math.round(avgSleep * 10) / 10}h. Aim for 7-9 hours for optimal recovery.`,
        action: "Prioritize sleep"
      });
    }

    if (workouts.length < 8 && workouts.length > 0) {
      recommendations.push({
        type: "consistency",
        priority: "medium",
        title: "Build Consistency",
        description: "You've logged workouts but could improve frequency. Aim for 3-4 sessions per week.",
        action: "Increase frequency"
      });
    }

    if (weeklyVolumes[0] < weeklyVolumes[1] * 0.8) {
      recommendations.push({
        type: "volume",
        priority: "low",
        title: "Volume Dropped",
        description: "Weekly volume is down 20%+ from last week. Consider if this is intentional.",
        action: "Review programming"
      });
    }

    return NextResponse.json({
      recommendations,
      exerciseRecommendations,
      stats: {
        weeklyVolumes,
        avgSleep,
        avgSoreness,
        needsDeload,
        workoutsThisMonth: workouts.length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
