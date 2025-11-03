import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recovery from '@/lib/models/Recovery';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const recoveryLogs = await Recovery.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    return NextResponse.json({ recovery: recoveryLogs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recovery logs:', error);
    return NextResponse.json({ error: 'Failed to fetch recovery logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, date, sleepHours, sleepQuality, soreness, stress, notes } = body;

    if (!userId || !date || sleepHours === undefined || sleepQuality === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recovery = await Recovery.create({
      userId,
      date: new Date(date),
      sleepHours,
      sleepQuality,
      soreness: soreness || 5,
      stress: stress || 5,
      notes,
    });

    return NextResponse.json({ recovery }, { status: 201 });
  } catch (error) {
    console.error('Error creating recovery log:', error);
    return NextResponse.json({ error: 'Failed to create recovery log' }, { status: 500 });
  }
}
