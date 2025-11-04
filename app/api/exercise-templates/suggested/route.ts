import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ExerciseTemplate from '@/lib/models/ExerciseTemplate';
import Workout from '@/lib/models/Workout';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Get last 3 workouts to determine muscle groups trained
    const recentWorkouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .limit(3);

    if (recentWorkouts.length === 0) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }

    // Extract muscle groups from recent workouts
    const recentMuscleGroups = new Set<string>();
    recentWorkouts.forEach(workout => {
      workout.exercises?.forEach((ex: any) => {
        if (ex.muscleGroup) {
          recentMuscleGroups.add(ex.muscleGroup.toLowerCase());
        }
      });
    });

    // Define muscle group rotation logic
    const muscleGroupRotation: Record<string, string[]> = {
      'chest': ['back', 'legs'],
      'back': ['legs', 'shoulders'],
      'legs': ['chest', 'shoulders', 'arms'],
      'shoulders': ['chest', 'arms'],
      'arms': ['chest', 'back', 'legs'],
    };

    // Determine suggested muscle groups
    const suggestedGroups = new Set<string>();
    recentMuscleGroups.forEach(group => {
      const suggestions = muscleGroupRotation[group] || [];
      suggestions.forEach(sg => suggestedGroups.add(sg));
    });

    // If no recent workouts or unclear pattern, suggest all major groups
    if (suggestedGroups.size === 0) {
      ['chest', 'back', 'legs', 'shoulders'].forEach(g => suggestedGroups.add(g));
    }

    // Get templates for suggested muscle groups
    const suggestions = await ExerciseTemplate.find({
      userId,
      muscleGroup: { $in: Array.from(suggestedGroups) }
    })
      .sort({ timesLogged: -1 })
      .limit(3);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching suggested exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
