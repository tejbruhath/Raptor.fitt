import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import StrengthIndex from '@/lib/models/StrengthIndex';
import { calculateStrengthIndexFrom1RMs } from '@/lib/strengthIndex';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
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

    // Use session userId instead of trusting body
    const userId = session.user.id;

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

    return NextResponse.json({ 
      message: 'Onboarding complete', 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        onboarded: user.onboarded,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
