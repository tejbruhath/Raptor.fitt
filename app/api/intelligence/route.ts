import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import Recovery from '@/lib/models/Recovery';
import Nutrition from '@/lib/models/Nutrition';
import { generateInsight, analyzeInjuryRisk } from '@/lib/ai/geminiService';
import { getUserAnalytics, cacheUserAnalytics } from '@/lib/redis/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Check cache first
    const cached = await getUserAnalytics(userId);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    // Fetch recent data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workouts, recoveryLogs, nutritionLogs] = await Promise.all([
      Workout.find({
        userId,
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 }),
      Recovery.find({
        userId,
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 }),
      Nutrition.find({
        userId,
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 }),
    ]);

    // Calculate metrics
    const totalVolume = workouts.reduce((total, workout) => {
      return (
        total +
        workout.exercises.reduce((exTotal: number, exercise: any) => {
          return (
            exTotal +
            exercise.sets.reduce((setTotal: number, set: any) => {
              return setTotal + set.weight * set.reps;
            }, 0)
          );
        }, 0)
      );
    }, 0);

    const avgCalories = nutritionLogs.length
      ? nutritionLogs.reduce((sum, n) => sum + n.totalCalories, 0) / nutritionLogs.length
      : 0;

    const avgSleep = recoveryLogs.length
      ? recoveryLogs.reduce((sum, r) => sum + r.hoursSlept, 0) / recoveryLogs.length
      : 0;

    // Calculate consistency
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const workoutsLast7Days = workouts.filter((w) => new Date(w.date) >= last7Days);
    const consistencyIndex = Math.round((workoutsLast7Days.length / 7) * 100);

    // Generate AI insights
    let insights = [];
    
    // Strength insight
    if (workouts.length >= 3) {
      const strengthInsight = await generateInsight({
        type: 'strength',
        data: {
          recentWorkouts: workouts.slice(0, 5),
          totalVolume,
        },
      });
      if (strengthInsight) insights.push(strengthInsight);
    }

    // Recovery insight
    if (recoveryLogs.length >= 3) {
      const recoveryInsight = await generateInsight({
        type: 'recovery',
        data: {
          recentLogs: recoveryLogs.slice(0, 7),
          avgSleep,
        },
      });
      if (recoveryInsight) insights.push(recoveryInsight);
    }

    // Injury risk analysis
    const injuryRisk = await analyzeInjuryRisk({
      recentWorkouts: workouts.slice(0, 7),
      sleep: recoveryLogs.slice(0, 7),
      soreness: recoveryLogs.slice(0, 7).map((r) => r.soreness || 5),
    });

    const result = {
      metrics: {
        totalVolume30Days: Math.round(totalVolume),
        avgCalories,
        avgSleep,
        consistencyIndex,
        workoutCount: workouts.length,
      },
      insights,
      injuryRisk,
      timestamp: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await cacheUserAnalytics(userId, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate intelligence data' },
      { status: 500 }
    );
  }
}
