import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Follow } from '@/lib/models/Social';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followerId, followingId, action } = body;

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'Follower and following IDs required' },
        { status: 400 }
      );
    }

    await dbConnect();

    if (action === 'follow') {
      const existing = await Follow.findOne({ followerId, followingId });
      if (existing) {
        return NextResponse.json({ message: 'Already following' }, { status: 200 });
      }

      await Follow.create({ followerId, followingId });
      return NextResponse.json({ message: 'Followed successfully' }, { status: 201 });
    } else if (action === 'unfollow') {
      await Follow.deleteOne({ followerId, followingId });
      return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Failed to process follow' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'following' or 'followers'

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await dbConnect();

    let follows;
    if (type === 'following') {
      follows = await Follow.find({ followerId: userId }).populate('followingId');
    } else {
      follows = await Follow.find({ followingId: userId }).populate('followerId');
    }

    return NextResponse.json({ follows }, { status: 200 });
  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 });
  }
}
