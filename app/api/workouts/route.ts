import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const workouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    return NextResponse.json({ workouts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, date, exercises, notes, duration } = body;

    if (!userId || !date || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const workout = await Workout.create({
      userId,
      date: new Date(date),
      exercises,
      notes,
      duration,
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const workoutId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!workoutId || !userId) {
      return NextResponse.json({ error: 'Workout ID and user ID required' }, { status: 400 });
    }

    const workout = await Workout.findOne({ _id: workoutId, userId });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    await Workout.deleteOne({ _id: workoutId });

    return NextResponse.json({ message: 'Workout deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}

