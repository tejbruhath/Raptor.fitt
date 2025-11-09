import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DailyCheckIn from '@/lib/models/DailyCheckIn';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const userId = session.user.email;

    // Check if check-in already exists for today
    const today = new Date().toISOString().split('T')[0];
    let checkIn = await DailyCheckIn.findOne({
      userId,
      date: new Date(today),
    });

    if (checkIn) {
      // Update existing check-in
      Object.assign(checkIn, data);
      await checkIn.save();
    } else {
      // Create new check-in
      checkIn = await DailyCheckIn.create({
        userId,
        ...data,
        date: new Date(today),
      });
    }

    return NextResponse.json({
      success: true,
      checkIn,
    });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: 'Failed to save check-in' },
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
    const days = parseInt(searchParams.get('days') || '7');

    const checkIns = await DailyCheckIn.find({
      userId,
    })
      .sort({ date: -1 })
      .limit(days);

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error('Get check-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}
