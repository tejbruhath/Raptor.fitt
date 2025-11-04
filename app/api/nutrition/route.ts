import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Nutrition from '@/lib/models/Nutrition';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = session.user.id;
    const date = searchParams.get('date');

    let query: any = { userId };
    if (date) {
      query.date = new Date(date);
    }

    const nutrition = await Nutrition.find(query)
      .sort({ date: -1 })
      .limit(30);

    return NextResponse.json({ nutrition }, { status: 200 });
  } catch (error) {
    console.error('Error fetching nutrition:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { date, meals, waterIntake } = body;
    const userId = session.user.id;

    if (!date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize date to start of day for consistent comparison
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Calculate totals
    const totals = meals?.reduce(
      (acc: any, meal: any) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Check if nutrition log already exists for this user and date
    const existingLog = await Nutrition.findOne({
      userId,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    let nutrition;
    
    if (existingLog) {
      // Update existing log instead of creating duplicate
      nutrition = await Nutrition.findByIdAndUpdate(
        existingLog._id,
        {
          $set: {
            meals: meals || [],
            totalCalories: totals?.calories || 0,
            totalProtein: totals?.protein || 0,
            totalCarbs: totals?.carbs || 0,
            totalFats: totals?.fats || 0,
            waterIntake: waterIntake ?? existingLog.waterIntake,
          }
        },
        { new: true, runValidators: true }
      );
      
      return NextResponse.json({ nutrition, updated: true }, { status: 200 });
    } else {
      // Create new log
      nutrition = await Nutrition.create({
        userId,
        date: queryDate,
        meals: meals || [],
        totalCalories: totals?.calories || 0,
        totalProtein: totals?.protein || 0,
        totalCarbs: totals?.carbs || 0,
        totalFats: totals?.fats || 0,
        waterIntake: waterIntake || 0,
      });

      return NextResponse.json({ nutrition, created: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating nutrition log:', error);
    return NextResponse.json({ error: 'Failed to create nutrition log' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { nutritionId, date, meals, waterIntake } = body;

    if (!nutritionId) {
      return NextResponse.json({ error: 'Nutrition ID required' }, { status: 400 });
    }

    const totals = meals?.reduce(
      (acc: any, meal: any) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const nutrition = await Nutrition.findOneAndUpdate(
      { _id: nutritionId, userId: session.user.id },
      {
        $set: {
          date: date ? new Date(date) : undefined,
          meals: meals || [],
          totalCalories: totals?.calories || 0,
          totalProtein: totals?.protein || 0,
          totalCarbs: totals?.carbs || 0,
          totalFats: totals?.fats || 0,
          waterIntake: waterIntake || 0,
        },
      },
      { new: true, runValidators: true }
    );

    if (!nutrition) {
      return NextResponse.json({ error: 'Nutrition log not found' }, { status: 404 });
    }

    return NextResponse.json({ nutrition }, { status: 200 });
  } catch (error) {
    console.error('Error updating nutrition log:', error);
    return NextResponse.json({ error: 'Failed to update nutrition log' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const nutritionId = searchParams.get('id');

    if (!nutritionId) {
      return NextResponse.json({ error: 'Nutrition ID required' }, { status: 400 });
    }

    const nutrition = await Nutrition.findOne({ _id: nutritionId, userId: session.user.id });

    if (!nutrition) {
      return NextResponse.json({ error: 'Nutrition log not found' }, { status: 404 });
    }

    await Nutrition.deleteOne({ _id: nutritionId });

    return NextResponse.json({ message: 'Nutrition log deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    return NextResponse.json({ error: 'Failed to delete nutrition log' }, { status: 500 });
  }
}
