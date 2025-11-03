import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import StrengthIndex from '@/lib/models/StrengthIndex';
import { calculateStrengthIndexFrom1RMs } from '@/lib/strengthIndex';

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

    // Calculate initial SI from 1RM values if provided
    if (benchPress1RM || squat1RM || deadlift1RM) {
      try {
        const currentBW = bodyweight || user.bodyweight?.[user.bodyweight.length - 1] || 70;
        const { totalSI, breakdown } = calculateStrengthIndexFrom1RMs({
          benchPress1RM: benchPress1RM || 0,
          squat1RM: squat1RM || 0,
          deadlift1RM: deadlift1RM || 0,
        }, currentBW);

        // Create initial SI snapshot
        await StrengthIndex.create({
          userId,
          date: new Date(),
          totalSI,
          breakdown,
          change: 0,
          changePercent: 0,
        });

        console.log('✅ Initial SI calculated from onboarding:', totalSI);
      } catch (siError) {
        console.error('Failed to calculate initial SI:', siError);
        // Don't fail onboarding if SI calculation fails
      }
    }

    return NextResponse.json({ message: 'Onboarding complete', user }, { status: 200 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
