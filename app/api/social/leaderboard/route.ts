import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StrengthIndex from '@/lib/models/StrengthIndex';
import User from '@/lib/models/User';
import Workout from '@/lib/models/Workout';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all users with their latest SI
    const users = await User.find({}).select('_id name email');

    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const latestSI = await StrengthIndex.findOne({ userId: user._id })
          .sort({ date: -1 })
          .limit(1);

        const previousSI = await StrengthIndex.findOne({ userId: user._id })
          .sort({ date: -1 })
          .skip(1)
          .limit(1);

        const workoutCount = await Workout.countDocuments({ userId: user._id });

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const recentWorkouts = await Workout.find({
          userId: user._id,
          date: { $gte: last7Days },
        });

        const weeklyVolume = recentWorkouts.reduce((sum, w) => {
          return (
            sum +
            w.exercises.reduce((exSum: number, ex: any) => {
              return (
                exSum +
                ex.sets.reduce((setSum: number, set: any) => {
                  return setSum + set.reps * set.weight;
                }, 0)
              );
            }, 0)
          );
        }, 0);

        return {
          userId: user._id,
          username: user.name,
          strengthIndex: latestSI?.totalSI || 0,
          change:
            latestSI && previousSI ? latestSI.totalSI - previousSI.totalSI : 0,
          totalWorkouts: workoutCount,
          weeklyVolume: Math.round(weeklyVolume),
        };
      })
    );

    // Sort by SI and add rank
    leaderboard.sort((a, b) => b.strengthIndex - a.strengthIndex);
    leaderboard.forEach((entry, index) => {
      (entry as any).rank = index + 1;
    });

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
