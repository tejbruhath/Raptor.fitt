import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Crew from '@/lib/models/Crew';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { inviteCode } = await request.json();
    const userId = session.user.email;

    const crew = await Crew.findOne({ inviteCode, isActive: true });

    if (!crew) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if already a member
    const isMember = crew.members.some((m: any) => m.userId === userId);
    if (isMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Check if crew is full
    if (crew.members.length >= crew.maxMembers) {
      return NextResponse.json({ error: 'Crew is full' }, { status: 400 });
    }

    // Add member
    crew.members.push({
      userId,
      name: session.user.name || 'User',
      avatar: (session.user as any).image,
      joinedAt: new Date(),
      role: 'member',
    });

    await crew.save();

    return NextResponse.json({ crew });
  } catch (error) {
    console.error('Join crew error:', error);
    return NextResponse.json(
      { error: 'Failed to join crew' },
      { status: 500 }
    );
  }
}
