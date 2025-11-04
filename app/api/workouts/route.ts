import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import StrengthIndex from '@/lib/models/StrengthIndex';
import User from '@/lib/models/User';
import { calculateStrengthIndex } from '@/lib/strengthIndex';
import { workoutSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and scope to session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = session.user.id;

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
    // Authenticate and scope to session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    
    // SECURITY: Input validation (override userId with session id before validation)
    const payload = { ...body, userId: session.user.id };
    const validationResult = workoutSchema.safeParse(payload);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { userId, date, exercises, notes, duration } = validationResult.data;

    const workout = await Workout.create({
      userId,
      date: new Date(date),
      exercises,
      notes,
      duration,
    });

    // Automatically calculate and save new SI snapshot
    try {
      const user = await User.findById(userId);
      if (user) {
        // Get ALL workouts (not just recent) for accurate SI
        const allWorkouts = await Workout.find({ userId });
        const currentBW = user.bodyweight?.[user.bodyweight.length - 1] || user.bodyweight || 70;
        
        const { totalSI, breakdown } = calculateStrengthIndex(allWorkouts, currentBW);

        // Get previous SI for change calculation
        const previousSI = await StrengthIndex.findOne({ userId }).sort({ date: -1 }).limit(1);
        const change = previousSI ? totalSI - previousSI.totalSI : 0;
        const changePercent = previousSI ? ((totalSI - previousSI.totalSI) / previousSI.totalSI) * 100 : 0;

        // Only save if SI has changed or this is the first SI
        if (!previousSI || Math.abs(change) > 0.1) {
          await StrengthIndex.create({
            userId,
            date: new Date(),
            totalSI,
            breakdown,
            change,
            changePercent,
          });
        }
      }
    } catch (siError) {
      console.error('Failed to update SI after workout:', siError);
      // Don't fail workout creation if SI calculation fails
    }

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { workoutId, date, exercises, notes, duration } = body;

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID required' }, { status: 400 });
    }

    const workout = await Workout.findOneAndUpdate(
      { _id: workoutId, userId: session.user.id },
      {
        $set: {
          date: date ? new Date(date) : undefined,
          exercises,
          notes,
          duration,
        },
      },
      { new: true, runValidators: true }
    );

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    return NextResponse.json({ workout }, { status: 200 });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const workoutId = searchParams.get('id');

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID required' }, { status: 400 });
    }

    const workout = await Workout.findOne({ _id: workoutId, userId: session.user.id });

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

