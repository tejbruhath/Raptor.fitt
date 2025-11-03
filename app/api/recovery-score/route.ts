import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Recovery from '@/lib/models/Recovery';
import Workout from '@/lib/models/Workout';
import { calculateRecoveryScore, getRecoveryAdvice } from '@/lib/intelligence/recoveryIndex';

/**
 * GET /api/recovery-score
 * Calculate user's recovery score (Ready Score 0-100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    await dbConnect();

    // Fetch recent sleep data (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentSleep = await Recovery.find({
      userId,
      date: { $gte: weekAgo },
    }).sort({ date: -1 }).lean();

    // Fetch recent workouts (last 7 days) 
    const recentWorkouts = await Workout.find({
      userId,
      date: { $gte: weekAgo },
    }).sort({ date: -1 }).lean();

    // Transform data for recovery calculation
    const sleepData = recentSleep.map(s => ({
      date: s.date.toISOString(),
      hours: s.sleepHours,
      quality: s.sleepQuality / 2, // Convert 1-10 to 1-5 scale
    }));

    const workoutData = recentWorkouts.map(w => {
      const muscleGroups = [...new Set(w.exercises.map((e: any) => e.muscleGroup))] as string[];
      const totalVolume = w.exercises.reduce((sum: number, ex: any) => {
        return sum + ex.sets.reduce((s: number, set: any) => {
          return s + set.reps * set.weight;
        }, 0);
      }, 0);

      // Calculate average RPE (if tracked)
      const rpeSets = w.exercises.flatMap((ex: any) => ex.sets.filter((s: any) => s.rpe));
      const avgRPE = rpeSets.length > 0
        ? rpeSets.reduce((sum: number, set: any) => sum + set.rpe, 0) / rpeSets.length
        : 7; // Default RPE if not tracked

      return {
        date: w.date.toISOString(),
        muscleGroups,
        totalVolume,
        avgRPE,
        duration: w.duration || 60, // Default 60 minutes if not tracked
      };
    });

    // Calculate recovery score
    const recoveryScore = calculateRecoveryScore(sleepData, workoutData);
    const advice = getRecoveryAdvice(recoveryScore);

    return NextResponse.json({
      recoveryScore,
      advice,
      dataPoints: {
        sleepEntries: sleepData.length,
        workoutEntries: workoutData.length,
      },
    });
  } catch (error) {
    console.error('Failed to calculate recovery score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate recovery score' },
      { status: 500 }
    );
  }
}
