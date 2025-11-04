import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Nutrition from '@/lib/models/Nutrition';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    // Sanitize and clamp limit (min 1, max 50)
    const rawLimit = searchParams.get('limit');
    const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(parsedLimit, 50))
      : 10;
    const userId = session.user.id;

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
