import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import Workout from '@/lib/models/Workout';
import Nutrition from '@/lib/models/Nutrition';
import Recovery from '@/lib/models/Recovery';
import StrengthIndex from '@/lib/models/StrengthIndex';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId } = body;

    if (!query || !userId) {
      return NextResponse.json({ error: 'Query and userId required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    await dbConnect();

    // Build comprehensive user context
    const [user, workouts, nutrition, recovery, strengthIndex] = await Promise.all([
      User.findOne({ _id: userId }),
      Workout.find({ userId }).sort({ date: -1 }).limit(30),
      Nutrition.find({ userId }).sort({ date: -1 }).limit(30),
      Recovery.find({ userId }).sort({ date: -1 }).limit(30),
      StrengthIndex.find({ userId }).sort({ date: -1 }).limit(10),
    ]);

    // Calculate recent stats
    const totalWorkouts = workouts.length;
    const recentVolume = workouts.slice(0, 7).reduce((sum, w) => {
      return sum + w.exercises.reduce((exSum: number, ex: any) => {
        return exSum + ex.sets.reduce((setSum: number, set: any) => {
          return setSum + (set.reps * set.weight);
        }, 0);
      }, 0);
    }, 0);

    const avgSleep = recovery.length > 0
      ? recovery.reduce((sum, r) => sum + r.sleepHours, 0) / recovery.length
      : 0;

    const currentSI = strengthIndex[0]?.totalSI || 0;
    const siTrend = strengthIndex.length > 1
      ? ((strengthIndex[0]?.totalSI || 0) - (strengthIndex[1]?.totalSI || 0))
      : 0;

    const context = {
      user: {
        name: user?.name,
        bodyweight: user?.bodyweight,
        trainingAge: user?.trainingAge,
      },
      currentStats: {
        strengthIndex: currentSI,
        siTrend,
        totalWorkouts,
        recentVolume,
        avgSleep,
      },
      recentWorkouts: workouts.slice(0, 5).map(w => ({
        date: w.date,
        exercises: w.exercises.map((e: any) => e.name),
        totalSets: w.exercises.reduce((sum: number, e: any) => sum + e.sets.length, 0),
      })),
      recovery: recovery.slice(0, 7).map(r => ({
        date: r.date,
        sleep: r.sleepHours,
        quality: r.sleepQuality,
        soreness: r.soreness,
      })),
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are Raptor AI, a brutally honest, data-driven fitness coach. You analyze training data and provide direct, actionable insights. No fluff, no generic motivation - just facts and specific recommendations.

User Context:
${JSON.stringify(context, null, 2)}

Key Instructions:
- Be direct and concise (3-5 sentences max)
- Reference specific numbers from their data
- Point out patterns, both good and concerning
- Give one actionable next step
- Use a confident, no-nonsense tone

User Question: ${query}`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    return NextResponse.json({ response, context }, { status: 200 });
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
