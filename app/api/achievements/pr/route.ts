import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Achievement from '@/lib/models/Achievement';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prs } = body;

    if (!prs || !Array.isArray(prs)) {
      return NextResponse.json({ error: 'PRs array required' }, { status: 400 });
    }

    await dbConnect();

    const savedPRs = [];
    for (const pr of prs) {
      const newPR = await Achievement.create({
        userId: pr.userId,
        achievementId: `pr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${pr.exerciseName} PR`,
        description: `${pr.weight}kg x ${pr.reps} reps`,
        category: 'pr',
        icon: '🏆',
        isPR: true,
        exerciseName: pr.exerciseName,
        weight: pr.weight,
        reps: pr.reps,
        muscleGroup: pr.muscleGroup,
      });
      savedPRs.push(newPR);
    }

    return NextResponse.json(
      { message: `${savedPRs.length} PRs saved`, prs: savedPRs },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save PR error:', error);
    return NextResponse.json(
      { error: 'Failed to save PRs' },
      { status: 500 }
    );
  }
}
