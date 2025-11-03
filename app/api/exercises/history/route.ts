import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const exerciseName = searchParams.get('name');

    if (!userId || !exerciseName) {
      return NextResponse.json({ error: 'User ID and exercise name required' }, { status: 400 });
    }

    const workouts = await Workout.find({ userId }).sort({ date: 1 });

    // Filter exercises and calculate progression
    const history = workouts
      .map(workout => ({
        date: workout.date,
        exercises: workout.exercises.filter((ex: any) => ex.name === exerciseName),
      }))
      .filter(w => w.exercises.length > 0)
      .map(w => {
        const exercise = w.exercises[0];
        const maxWeight = Math.max(...exercise.sets.map((s: any) => s.weight));
        const totalVolume = exercise.sets.reduce((sum: number, s: any) => sum + s.reps * s.weight, 0);
        const avgRPE = exercise.sets.reduce((sum: number, s: any) => sum + (s.rpe || 0), 0) / exercise.sets.length;

        // Calculate estimated 1RM using Epley formula
        const heaviestSet = exercise.sets.reduce((prev: any, curr: any) => 
          curr.weight > prev.weight ? curr : prev
        );
        const estimated1RM = Math.round(heaviestSet.weight * (1 + heaviestSet.reps / 30));

        return {
          date: w.date,
          sets: exercise.sets.length,
          maxWeight,
          totalVolume,
          avgRPE: Math.round(avgRPE * 10) / 10,
          estimated1RM,
          allSets: exercise.sets,
        };
      });

    // Calculate PRs
    const prs = history.filter((entry, index) => {
      if (index === 0) return true;
      return entry.estimated1RM > Math.max(...history.slice(0, index).map(e => e.estimated1RM));
    });

    // Calculate stats
    const stats = {
      totalSessions: history.length,
      totalVolume: history.reduce((sum, e) => sum + e.totalVolume, 0),
      currentMax: history.length > 0 ? history[history.length - 1].estimated1RM : 0,
      allTimeMax: Math.max(...history.map(e => e.estimated1RM), 0),
      volumeTrend: history.length >= 2 
        ? ((history[history.length - 1].totalVolume - history[0].totalVolume) / history[0].totalVolume) * 100
        : 0,
    };

    return NextResponse.json({ 
      exerciseName,
      history,
      prs,
      stats,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise history' }, { status: 500 });
  }
}
