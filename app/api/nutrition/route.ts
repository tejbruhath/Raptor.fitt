import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Nutrition from '@/lib/models/Nutrition';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query: any = { userId };
    if (date) {
      const targetDate = new Date(date);

      // Normalize to UTC start of day for consistent querying
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      query.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
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
    await dbConnect();

    const body = await request.json();
    const { userId, date, meals, waterIntake = 0 } = body;

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize date to start of day (UTC) for consistent comparison
    const requestDate = new Date(date);
    const queryDate = new Date(requestDate);
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
            totalCalories: totals?.calories || 0,
            totalProtein: totals?.protein || 0,
            totalCarbs: totals?.carbs || 0,
            totalFats: totals?.fats || 0,
            waterIntake: waterIntake ?? existingLog.waterIntake,
            date: new Date(
              new Date(date).toLocaleString('en-US', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })
            ).toISOString(),
          }
        },
        { new: true, runValidators: true }
      );
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
    await dbConnect();

    const body = await request.json();
    const { nutritionId, userId, date, meals, waterIntake } = body;

    if (!nutritionId || !userId) {
      return NextResponse.json({ error: 'Nutrition ID and user ID required' }, { status: 400 });
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
      { _id: nutritionId, userId },
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
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const nutritionId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!nutritionId || !userId) {
      return NextResponse.json({ error: 'Nutrition ID and user ID required' }, { status: 400 });
    }

    const nutrition = await Nutrition.findOne({ _id: nutritionId, userId });

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
