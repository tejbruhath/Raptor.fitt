import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const exerciseName = searchParams.get('exercise');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (exerciseName) {
      // Get last two workouts containing this exercise
      const workouts = await Workout.find({
        userId,
        'exercises.name': exerciseName
      })
        .sort({ date: -1 })
        .limit(2);

      if (workouts.length < 2) {
        return NextResponse.json({ previousVolume: 0 }, { status: 200 });
      }

      // Calculate volume for previous workout (index 1)
      const previousWorkout = workouts[1];
      const exercise = previousWorkout.exercises?.find((ex: any) => ex.name === exerciseName);
      
      if (!exercise || !exercise.sets) {
        return NextResponse.json({ previousVolume: 0 }, { status: 200 });
      }

      const previousVolume = exercise.sets.reduce((total: number, set: any) => {
        return total + (set.weight || 0) * (set.reps || 0);
      }, 0);

      return NextResponse.json({ previousVolume }, { status: 200 });
    } else {
      // Get last two workouts total volume
      const workouts = await Workout.find({ userId })
        .sort({ date: -1 })
        .limit(2);

      if (workouts.length < 2) {
        return NextResponse.json({ previousVolume: 0 }, { status: 200 });
      }

      const previousWorkout = workouts[1];
      const previousVolume = previousWorkout.exercises?.reduce((total: number, ex: any) => {
        const exVolume = ex.sets?.reduce((setTotal: number, set: any) => {
          return setTotal + (set.weight || 0) * (set.reps || 0);
        }, 0) || 0;
        return total + exVolume;
      }, 0) || 0;

      return NextResponse.json({ previousVolume }, { status: 200 });
    }
  } catch (error) {
    console.error('Error calculating volume comparison:', error);
    return NextResponse.json({ error: 'Failed to calculate volume' }, { status: 500 });
  }
}
