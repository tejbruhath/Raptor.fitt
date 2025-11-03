import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Activity, Follow } from '@/lib/models/Social';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await dbConnect();

    // Get users this person follows
    const following = await Follow.find({ followerId: userId });
    const followingIds = following.map((f) => f.followingId);

    // Include own activities
    followingIds.push(userId as any);

    // Fetch activities from followed users
    const activities = await Activity.find({ userId: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name email');

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, description, metadata } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const activity = await Activity.create({
      userId,
      type,
      title,
      description,
      metadata,
      likes: [],
      comments: [],
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
