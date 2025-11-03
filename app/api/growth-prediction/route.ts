import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StrengthIndex from '@/lib/models/StrengthIndex';
import Workout from '@/lib/models/Workout';
import { 
  generateSIGrowthPrediction, 
  generateExerciseGrowthPrediction,
  calculate1RM 
} from '@/lib/enhancedGrowthPrediction';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const exerciseName = searchParams.get('exercise');
    const days = parseInt(searchParams.get('days') || '30');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (exerciseName) {
      // Get exercise-specific growth prediction
      const workouts = await Workout.find({ userId }).sort({ date: 1 });
      
      const exercise1RMHistory = workouts.flatMap((workout) => 
        workout.exercises
          .filter((ex: any) => ex.name.toLowerCase().trim() === exerciseName.toLowerCase().trim())
          .flatMap((ex: any) => 
            ex.sets.map((set: any) => ({
              date: workout.date,
              exerciseName: ex.name,
              weight: set.weight,
              reps: set.reps,
              estimated1RM: calculate1RM(set.weight, set.reps),
            }))
          )
      );

      if (exercise1RMHistory.length === 0) {
        return NextResponse.json(
          { error: `No data found for exercise: ${exerciseName}` },
          { status: 404 }
        );
      }

      const prediction = generateExerciseGrowthPrediction(exerciseName, exercise1RMHistory, days);

      return NextResponse.json({ prediction }, { status: 200 });
    }

    // Get overall SI growth prediction
    const strengthIndexData = await StrengthIndex.find({ userId })
      .sort({ date: 1 })
      .limit(90);

    if (strengthIndexData.length < 2) {
      return NextResponse.json(
        { 
          error: 'Insufficient data for prediction (min 2 data points)',
          message: 'Log more workouts to see growth predictions' 
        },
        { status: 400 }
      );
    }

    // Convert to SI history format
    const siHistory = strengthIndexData.map((si) => ({
      date: si.date,
      totalSI: si.totalSI,
    }));

    // Generate SI growth prediction
    const prediction = generateSIGrowthPrediction(siHistory, days);

    return NextResponse.json(
      {
        prediction,
        dataPoints: siHistory.length,
        startDate: siHistory[0].date,
        endDate: siHistory[siHistory.length - 1].date,
        currentSI: siHistory[siHistory.length - 1].totalSI,
        projectedSI: prediction.projectedSI30Days,
        weeklyGrowth: prediction.averageWeeklyGrowth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating growth prediction:', error);
    return NextResponse.json(
      { error: 'Failed to calculate growth prediction' },
      { status: 500 }
    );
  }
}
