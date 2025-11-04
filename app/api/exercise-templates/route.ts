import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ExerciseTemplate from '@/lib/models/ExerciseTemplate';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    // Sanitize and clamp limit to avoid NaN -> 0 behavior in Mongoose
    const rawLimit = searchParams.get('limit');
    const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(parsedLimit, 100))
      : 10;
    const userId = session.user.id;

    const templates = await ExerciseTemplate.find({ userId })
      .sort({ lastLoggedAt: -1 })
      .limit(limit);

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exercise templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, muscleGroup, weight, reps, sets } = body;
    const userId = session.user.id;

    if (!userId || !name || !muscleGroup) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find existing template or create new
    const existingTemplate = await ExerciseTemplate.findOne({ userId, name });

    if (existingTemplate) {
      // Update existing template
      existingTemplate.lastWeight = weight;
      existingTemplate.lastReps = reps;
      existingTemplate.lastSets = sets;
      existingTemplate.timesLogged = (existingTemplate.timesLogged || 0) + 1;
      existingTemplate.lastLoggedAt = new Date();
      
      // Calculate suggested weight for next session
      if (reps >= 10) {
        existingTemplate.suggestedWeight = weight + 2.5;
      } else if (reps >= 8) {
        existingTemplate.suggestedWeight = weight + 2.5;
      } else {
        existingTemplate.suggestedWeight = weight;
      }

      await existingTemplate.save();
      return NextResponse.json({ template: existingTemplate }, { status: 200 });
    } else {
      // Create new template
      const template = await ExerciseTemplate.create({
        userId,
        name,
        muscleGroup,
        lastWeight: weight,
        lastReps: reps,
        lastSets: sets,
        timesLogged: 1,
        lastLoggedAt: new Date(),
        suggestedWeight: reps >= 8 ? weight + 2.5 : weight,
      });

      return NextResponse.json({ template }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating template:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}
