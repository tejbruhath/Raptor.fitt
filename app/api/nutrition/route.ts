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
    await dbConnect();

    const body = await request.json();
    const { userId, date, meals, waterIntake } = body;

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const totals = meals?.reduce(
      (acc: any, meal: any) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const nutrition = await Nutrition.create({
      userId,
      date: new Date(date),
      meals: meals || [],
      totalCalories: totals?.calories || 0,
      totalProtein: totals?.protein || 0,
      totalCarbs: totals?.carbs || 0,
      totalFats: totals?.fats || 0,
      waterIntake: waterIntake || 0,
    });

    return NextResponse.json({ nutrition }, { status: 201 });
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
