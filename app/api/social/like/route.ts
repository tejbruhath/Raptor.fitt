import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Activity } from '@/lib/models/Social';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { activityId, userId } = body;

    if (!activityId || !userId) {
      return NextResponse.json({ error: 'Activity ID and user ID required' }, { status: 400 });
    }

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Toggle like
    const likeIndex = activity.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike
      activity.likes.splice(likeIndex, 1);
    } else {
      // Like
      activity.likes.push(userId);
    }

    await activity.save();

    return NextResponse.json({ 
      activity, 
      liked: likeIndex === -1,
      likeCount: activity.likes.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
