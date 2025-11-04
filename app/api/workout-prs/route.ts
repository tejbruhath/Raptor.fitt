import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkoutPR from '@/lib/models/WorkoutPR';
import { estimate1RM } from '@/lib/utils/workoutParsing';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const prs = await WorkoutPR.find({ userId })
      .sort({ achievedAt: -1 });

    return NextResponse.json({ prs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, exerciseName, weight, reps, workoutId } = body;

    if (!userId || !exerciseName || !weight || !reps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find existing PR for this exercise
    const existingPR = await WorkoutPR.findOne({ userId, exerciseName });

    // Calculate estimated 1RM
    const estimated1RM = estimate1RM(weight, reps);

    if (existingPR) {
      // Only update if new weight is higher
      if (weight > existingPR.maxWeight) {
        existingPR.maxWeight = weight;
        existingPR.reps = reps;
        existingPR.estimated1RM = estimated1RM;
        existingPR.achievedAt = new Date();
        existingPR.workoutId = workoutId;
        await existingPR.save();

        return NextResponse.json({ pr: existingPR, isNewPR: true }, { status: 200 });
      } else {
        return NextResponse.json({ pr: existingPR, isNewPR: false }, { status: 200 });
      }
    } else {
      // Create new PR
      const pr = await WorkoutPR.create({
        userId,
        exerciseName,
        maxWeight: weight,
        reps,
        estimated1RM,
        achievedAt: new Date(),
        workoutId,
      });

      return NextResponse.json({ pr, isNewPR: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating PR:', error);
    return NextResponse.json({ error: 'Failed to save PR' }, { status: 500 });
  }
}
