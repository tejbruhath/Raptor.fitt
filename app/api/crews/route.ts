import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Crew from '@/lib/models/Crew';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name, emoji } = await request.json();
    const userId = session.user.email;

    const inviteCode = nanoid();

    const crew = await Crew.create({
      name,
      emoji: emoji || '🦖',
      ownerId: userId,
      members: [
        {
          userId,
          name: session.user.name || 'User',
          avatar: (session.user as any).image,
          role: 'owner',
        },
      ],
      inviteCode,
      maxMembers: 5,
    });

    return NextResponse.json({ crew });
  } catch (error) {
    console.error('Create crew error:', error);
    return NextResponse.json(
      { error: 'Failed to create crew' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.email;

    const crews = await Crew.find({
      'members.userId': userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ crews });
  } catch (error) {
    console.error('Get crews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crews' },
      { status: 500 }
    );
  }
}
