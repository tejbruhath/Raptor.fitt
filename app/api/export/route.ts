import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import Nutrition from '@/lib/models/Nutrition';
import Recovery from '@/lib/models/Recovery';
import StrengthIndex from '@/lib/models/StrengthIndex';
import Achievement from '@/lib/models/Achievement';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const format = searchParams.get('format') || 'json';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch all user data
    const [user, workouts, nutrition, recovery, strengthIndex, achievements] = await Promise.all([
      User.findById(userId).select('-password'),
      Workout.find({ userId }).sort({ date: -1 }),
      Nutrition.find({ userId }).sort({ date: -1 }),
      Recovery.find({ userId }).sort({ date: -1 }),
      StrengthIndex.find({ userId }).sort({ date: -1 }),
      Achievement.find({ userId }).sort({ unlockedAt: -1 }),
    ]);

    const exportData = {
      user,
      workouts,
      nutrition,
      recovery,
      strengthIndex,
      achievements,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'csv') {
      // Generate CSV for workouts
      const csvHeaders = 'Date,Exercise,Sets,Reps,Weight,RPE\n';
      const csvRows = workouts.flatMap(workout =>
        workout.exercises.flatMap((ex: any) =>
          ex.sets.map((set: any) =>
            `${new Date(workout.date).toISOString()},${ex.name},1,${set.reps},${set.weight},${set.rpe || ''}`
          )
        )
      ).join('\n');

      return new NextResponse(csvHeaders + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="raptor-fitt-export-${Date.now()}.csv"`,
        },
      });
    }

    // JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="raptor-fitt-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
