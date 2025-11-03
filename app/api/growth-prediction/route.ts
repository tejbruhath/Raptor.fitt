import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StrengthIndex from '@/lib/models/StrengthIndex';
import { calculateExpectedGrowthCurve } from '@/lib/growthPrediction';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await dbConnect();

    // Fetch SI history
    const siHistory = await StrengthIndex.find({ userId })
      .sort({ date: 1 })
      .limit(60);

    if (siHistory.length < 2) {
      return NextResponse.json({
        expected: [],
        observed: [],
        futureProjection: [],
        message: 'Need at least 2 data points for prediction',
      });
    }

    // Convert to growth data points
    const dataPoints = siHistory.map((si) => ({
      date: si.date,
      value: si.totalSI,
    }));

    // Calculate growth curve
    const prediction = calculateExpectedGrowthCurve(dataPoints, 30);

    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error('Growth prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate growth prediction' },
      { status: 500 }
    );
  }
}
