import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import WorkoutPR from '@/lib/models/WorkoutPR';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exercise: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { exercise } = await params;
    const exerciseName = decodeURIComponent(exercise);

    const pr = await WorkoutPR.findOne({ userId: session.user.id, exerciseName })
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
