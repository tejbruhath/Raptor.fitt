import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StrengthIndex from '@/lib/models/StrengthIndex';
import Workout from '@/lib/models/Workout';
import User from '@/lib/models/User';
import { calculateStrengthIndex } from '@/lib/strengthIndex';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const strengthIndexData = await StrengthIndex.find({ userId })
      .sort({ date: -1 })
      .limit(90);

    return NextResponse.json({ strengthIndex: strengthIndexData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching strength index:', error);
    return NextResponse.json({ error: 'Failed to fetch strength index' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent workouts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentWorkouts = await Workout.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    });

    if (recentWorkouts.length === 0) {
      return NextResponse.json(
        { error: 'No workouts found to calculate SI' },
        { status: 404 }
      );
    }

    // Calculate SI
    const currentBW = user.bodyweight[user.bodyweight.length - 1] || 70;
    const { totalSI, breakdown } = calculateStrengthIndex(recentWorkouts, currentBW);

    // Get previous SI for change calculation
    const previousSI = await StrengthIndex.findOne({ userId })
      .sort({ date: -1 })
      .limit(1);

    const change = previousSI ? totalSI - previousSI.totalSI : 0;
    const changePercent = previousSI
      ? ((totalSI - previousSI.totalSI) / previousSI.totalSI) * 100
      : 0;

    // Create new SI snapshot
    const strengthIndex = await StrengthIndex.create({
      userId,
      date: new Date(),
      totalSI,
      breakdown,
      change,
      changePercent,
    });

    return NextResponse.json({ strengthIndex }, { status: 201 });
  } catch (error) {
    console.error('Error calculating strength index:', error);
    return NextResponse.json(
      { error: 'Failed to calculate strength index' },
      { status: 500 }
    );
  }
}
