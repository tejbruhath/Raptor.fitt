import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      userId,
      bodyweight,
      height,
      age,
      gender,
      trainingAge,
      recoveryType,
      goal,
      targetBodyweight,
      avgCalories,
      avgProtein,
      avgSleep,
      benchPress1RM,
      squat1RM,
      deadlift1RM,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user with onboarding data
    user.bodyweight = user.bodyweight || [];
    if (bodyweight) user.bodyweight.push(bodyweight);
    user.height = height || user.height;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.trainingAge = trainingAge || user.trainingAge;
    user.recoveryType = recoveryType || user.recoveryType;
    user.goal = goal || user.goal;
    user.onboarded = true;

    await user.save();

    return NextResponse.json({ message: 'Onboarding complete', user }, { status: 200 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
