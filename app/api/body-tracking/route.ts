import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import BodyTracking from '@/lib/models/BodyTracking';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const userId = session.user.email;

    const entry = await BodyTracking.create({
      userId,
      ...data,
      date: data.date || new Date(),
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Body tracking POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create body tracking entry' },
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const entries = await BodyTracking.find({ userId })
      .sort({ date: -1 })
      .limit(limit);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Body tracking GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch body tracking entries' },
      { status: 500 }
    );
  }
}
