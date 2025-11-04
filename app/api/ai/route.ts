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

    console.log('🤖 AI Request:', { query, userId });

    if (!query || !userId) {
      return NextResponse.json({ error: 'Query and userId required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ Gemini API key not found');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    await dbConnect();
    console.log('✅ Database connected');

    // Build comprehensive user context with error handling
    let user: any;
    let workouts: any[];
    let nutrition: any[];
    let recovery: any[];
    let strengthIndex: any[];
    
    try {
      [user, workouts, nutrition, recovery, strengthIndex] = await Promise.all([
        User.findById(userId).lean(),
        Workout.find({ userId }).sort({ date: -1 }).limit(30).lean(),
        Nutrition.find({ userId }).sort({ date: -1 }).limit(30).lean(),
        Recovery.find({ userId }).sort({ date: -1 }).limit(30).lean(),
        StrengthIndex.find({ userId }).sort({ date: -1 }).limit(10).lean(),
      ]);
      console.log('✅ User data fetched:', {
        user: !!user,
        workouts: workouts.length,
        nutrition: nutrition.length,
        recovery: recovery.length,
        si: strengthIndex.length
      });
    } catch (dbError: any) {
      console.error('❌ Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: dbError.message },
        { status: 500 }
      );
    }

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
        name: user?.name || 'User',
        bodyweight: user?.bodyweight || 0,
        trainingAge: user?.trainingAge || 0,
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
    
    console.log('📊 Context built:', {
      hasUser: !!user,
      workouts: workouts.length,
      recovery: recovery.length,
      si: currentSI
    });

    // Initialize Gemini AI
    let genAI, model, result, response;
    
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      
      // Debug: List available models
      try {
        const availableModels = await genAI.listModels();
        console.log('📋 Available Gemini models:', availableModels.data.map(m => m.name));
      } catch (listError) {
        console.log('⚠️ Could not list models:', listError.message);
      }
      
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('✅ Gemini model initialized');
    } catch (initError: any) {
      console.error('❌ Gemini initialization error:', initError);
      return NextResponse.json(
        { error: 'Failed to initialize AI model', details: initError.message },
        { status: 500 }
      );
    }

    const systemPrompt = `You are Raptor AI, a brutally honest, data-driven fitness coach. You analyze training data and provide direct, actionable insights. No fluff, no generic motivation - just facts and specific recommendations.

User Context:
${JSON.stringify(context, null, 2)}

Key Instructions:
- Be direct and concise (3-5 sentences max)
- Reference specific numbers from their data
- Point out patterns, both good and concerning
- Give one actionable next step
- Use a confident, no-nonsense tone
- If user has no data yet, acknowledge it and give beginner advice

User Question: ${query}`;

    try {
      console.log('🔄 Sending request to Gemini...');
      result = await model.generateContent(systemPrompt);
      response = result.response.text();
      console.log('✅ Gemini response received');
    } catch (geminiError: any) {
      console.error('❌ Gemini API error:', geminiError);
      return NextResponse.json(
        { error: 'Failed to generate AI response', details: geminiError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ response, context }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Unexpected AI Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response', stack: error.stack },
      { status: 500 }
    );
  }
}
