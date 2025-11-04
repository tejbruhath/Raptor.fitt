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
      // Get last workout containing this specific exercise
      const workouts = await Workout.find({
        userId,
        'exercises.name': exerciseName
      })
        .sort({ date: -1 })
        .limit(1);

      if (workouts.length === 0) {
        return NextResponse.json({ workout: null }, { status: 200 });
      }

      // Extract the specific exercise data
      const workout = workouts[0];
      const exercise = workout.exercises?.find((ex: any) => ex.name === exerciseName);

      return NextResponse.json({
        workout: {
          date: workout.date,
          exercise: exercise || null
        }
      }, { status: 200 });
    } else {
      // Get last overall workout
      const workout = await Workout.findOne({ userId })
        .sort({ date: -1 });

      return NextResponse.json({ workout }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching last workout:', error);
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
  }
}
