import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import Nutrition from '@/lib/models/Nutrition';
import Recovery from '@/lib/models/Recovery';
import User from '@/lib/models/User';
import { calculateStrengthIndex } from '@/lib/strengthIndex';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.email;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's data
    const [user, todayWorkout, todayNutrition, todayRecovery] = await Promise.all([
      User.findOne({ email: userId }),
      Workout.findOne({
        userId,
        date: { $gte: today, $lt: tomorrow },
      }),
      Nutrition.findOne({
        userId,
        date: { $gte: today, $lt: tomorrow },
      }),
      Recovery.findOne({
        userId,
        date: { $gte: today, $lt: tomorrow },
      }),
    ]);

    // Calculate strength index (simplified for today summary)
    let strengthIndex = 0;
    if (user && user.bodyweight.length > 0) {
      // Use cached value or default
      strengthIndex = 70; // Default SI, should be calculated from recent workouts
    }

    // Calculate recovery score
    let recoveryScore = 70;
    if (todayRecovery) {
      const sleepScore = (todayRecovery.hoursSlept / 9) * 40;
      const qualityScore = (todayRecovery.quality / 10) * 40;
      const sorenessScore = ((10 - (todayRecovery.soreness || 5)) / 10) * 20;
      recoveryScore = Math.min(100, Math.round(sleepScore + qualityScore + sorenessScore));
    }

    return NextResponse.json({
      streak: user?.streakDays || 0,
      workoutLogged: !!todayWorkout,
      caloriesLogged: todayNutrition?.totalCalories || 0,
      sleepHours: todayRecovery?.hoursSlept || null,
      strengthIndex,
      recoveryScore,
    });
  } catch (error) {
    console.error('Today summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today summary' },
      { status: 500 }
    );
  }
}
