import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Nutrition from '@/lib/models/Nutrition';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get recent nutrition logs
    const nutritionLogs = await Nutrition.find({ userId })
      .sort({ date: -1 })
      .limit(30); // Look at last 30 days

    // Extract unique food names from smart logs
    const foodNames = new Set<string>();
    nutritionLogs.forEach(log => {
      log.meals?.forEach((meal: any) => {
        if (meal.foodName && meal.type === 'smart') {
          foodNames.add(meal.foodName);
        }
      });
    });

    // Convert to array and limit
    const recentFoods = Array.from(foodNames).slice(0, limit);

    return NextResponse.json({ foods: recentFoods }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recent foods:', error);
    return NextResponse.json({ error: 'Failed to fetch recent foods' }, { status: 500 });
  }
}
