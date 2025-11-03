import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Activity } from '@/lib/models/Social';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { activityId, userId, text } = body;

    if (!activityId || !userId || !text) {
      return NextResponse.json({ error: 'Activity ID, user ID, and text required' }, { status: 400 });
    }

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    activity.comments.push({
      userId,
      text,
      createdAt: new Date(),
    });

    await activity.save();

    // Populate the new comment with user info
    await activity.populate('comments.userId', 'name email');

    return NextResponse.json({ 
      activity,
      comment: activity.comments[activity.comments.length - 1]
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    const activity = await Activity.findById(activityId)
      .populate('comments.userId', 'name email');

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ comments: activity.comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
