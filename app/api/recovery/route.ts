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

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { recoveryId, userId, date, sleepHours, sleepQuality, soreness, stress, notes } = body;

    if (!recoveryId || !userId) {
      return NextResponse.json({ error: 'Recovery ID and user ID required' }, { status: 400 });
    }

    const recovery = await Recovery.findOneAndUpdate(
      { _id: recoveryId, userId },
      {
        $set: {
          date: date ? new Date(date) : undefined,
          sleepHours,
          sleepQuality,
          soreness,
          stress,
          notes,
        },
      },
      { new: true, runValidators: true }
    );

    if (!recovery) {
      return NextResponse.json({ error: 'Recovery log not found' }, { status: 404 });
    }

    return NextResponse.json({ recovery }, { status: 200 });
  } catch (error) {
    console.error('Error updating recovery log:', error);
    return NextResponse.json({ error: 'Failed to update recovery log' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const recoveryId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!recoveryId || !userId) {
      return NextResponse.json({ error: 'Recovery ID and user ID required' }, { status: 400 });
    }

    const recovery = await Recovery.findOne({ _id: recoveryId, userId });

    if (!recovery) {
      return NextResponse.json({ error: 'Recovery log not found' }, { status: 404 });
    }

    await Recovery.deleteOne({ _id: recoveryId });

    return NextResponse.json({ message: 'Recovery log deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting recovery log:', error);
    return NextResponse.json({ error: 'Failed to delete recovery log' }, { status: 500 });
  }
}
