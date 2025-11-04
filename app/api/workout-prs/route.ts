import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import WorkoutPR from '@/lib/models/WorkoutPR';
import { estimate1RM } from '@/lib/utils/workoutParsing';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

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

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseName, weight, reps, workoutId } = body;
    const userId = session.user.id;

    // Validate required fields (allow zero weight but not null/undefined)
    if (!userId || !exerciseName || weight == null || reps == null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate numeric sanity
    if (
      typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0 ||
      typeof reps !== 'number' || !Number.isInteger(reps) || reps <= 0
    ) {
      return NextResponse.json(
        { error: 'Invalid weight or reps' },
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
