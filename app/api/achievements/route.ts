import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Achievement from '@/lib/models/Achievement';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import Workout from '@/lib/models/Workout';
import StrengthIndex from '@/lib/models/StrengthIndex';
import { Follow } from '@/lib/models/Social';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;
    const unlocked = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

    return NextResponse.json({ achievements: unlocked }, { status: 200 });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;

    const workouts = await Workout.find({ userId });
    const siHistory = await StrengthIndex.find({ userId });
    const following = await Follow.find({ followerId: userId });

    const newAchievements: any[] = [];

    // Check each achievement
    for (const ach of ACHIEVEMENTS) {
      const existing = await Achievement.findOne({
        userId,
        achievementId: ach.id,
      });

      if (!existing) {
        let unlocked = false;

        switch (ach.id) {
          case 'first_workout':
            unlocked = workouts.length >= 1;
            break;
          case 'workouts_50':
            unlocked = workouts.length >= 50;
            break;
          case 'workouts_100':
            unlocked = workouts.length >= 100;
            break;
          case 'si_100':
            unlocked = siHistory.some((si) => si.totalSI >= 100);
            break;
          case 'si_150':
            unlocked = siHistory.some((si) => si.totalSI >= 150);
            break;
          case 'si_200':
            unlocked = siHistory.some((si) => si.totalSI >= 200);
            break;
          case 'social_first_follow':
            unlocked = following.length >= 1;
            break;
          case 'social_10_followers':
            const followers = await Follow.countDocuments({ followingId: userId });
            unlocked = followers >= 10;
            break;
        }

        if (unlocked) {
          const newAch = await Achievement.create({
            userId,
            achievementId: ach.id,
            title: ach.title,
            description: ach.description,
            category: ach.category,
            icon: ach.icon,
          });
          newAchievements.push(newAch);
        }
      }
    }

    return NextResponse.json(
      {
        message: `Checked achievements, ${newAchievements.length} new unlocks`,
        newAchievements,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
