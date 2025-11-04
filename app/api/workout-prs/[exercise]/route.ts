import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkoutPR from '@/lib/models/WorkoutPR';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exercise: string }> }
) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const { exercise } = await params;
    const exerciseName = decodeURIComponent(exercise);

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const pr = await WorkoutPR.findOne({ userId, exerciseName })
      .sort({ achievedAt: -1 });

    if (!pr) {
      return NextResponse.json({ pr: null, maxWeight: 0 }, { status: 200 });
    }

    return NextResponse.json({ pr, maxWeight: pr.maxWeight }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exercise PR:', error);
    return NextResponse.json({ error: 'Failed to fetch PR' }, { status: 500 });
  }
}
