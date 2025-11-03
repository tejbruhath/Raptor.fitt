import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Workout from '@/lib/models/Workout';
import Nutrition from '@/lib/models/Nutrition';

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Fetch user data for context
    const user = await User.findById(userId).select('-password');
    
    // Fetch recent workouts
    const recentWorkouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    // Fetch recent nutrition
    const recentNutrition = await Nutrition.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    // Calculate stats
    const totalWorkouts = await Workout.countDocuments({ userId });
    const avgCalories = recentNutrition.length > 0
      ? recentNutrition.reduce((sum, n) => sum + n.totalCalories, 0) / recentNutrition.length
      : 0;

    // Build context for AI
    const userContext = {
      name: user?.name || 'User',
      age: user?.age || 'unknown',
      bodyweight: user?.bodyweight || 'unknown',
      height: user?.height || 'unknown',
      goal: user?.goal || 'general fitness',
      trainingAge: user?.trainingAge || 'beginner',
      totalWorkouts,
      recentWorkoutsCount: recentWorkouts.length,
      avgCalories: Math.round(avgCalories),
      lastWorkoutDate: recentWorkouts[0]?.date || 'No recent workouts',
    };

    // Generate AI response (using a simple template system for now)
    // In production, you'd integrate with OpenAI API here
    const aiResponse = generateCoachResponse(message, userContext, recentWorkouts);

    return NextResponse.json({ 
      response: aiResponse,
      context: userContext 
    }, { status: 200 });
  } catch (error) {
    console.error('AI Coach error:', error);
    return NextResponse.json(
      { error: 'Failed to get coach response' },
      { status: 500 }
    );
  }
}

function generateCoachResponse(message: string, context: any, workouts: any[]): string {
  const msg = message.toLowerCase();

  // Workout advice
  if (msg.includes('workout') || msg.includes('train') || msg.includes('exercise')) {
    if (workouts.length === 0) {
      return `Hey ${context.name}! I see you haven't logged any workouts yet. Let's start with a simple full-body routine 3x per week. Focus on compound movements like squats, bench press, and rows. Start with 3 sets of 8-12 reps for each exercise. Ready to crush it? 💪`;
    }
    
    const lastWorkout = workouts[0];
    const muscleGroups = new Set<string>(lastWorkout.exercises.map((e: any) => e.muscleGroup as string));
    const muscleGroupsArray = Array.from(muscleGroups);
    
    return `Based on your last workout (${new Date(lastWorkout.date).toLocaleDateString()}), you trained ${muscleGroupsArray.join(', ')}. For optimal recovery and growth, I'd recommend hitting different muscle groups today. How about focusing on ${getSuggestedMuscleGroups(muscleGroupsArray)}? Aim for progressive overload - try adding 2.5-5kg or 1-2 reps from last time! 🎯`;
  }

  // Nutrition advice
  if (msg.includes('nutrition') || msg.includes('diet') || msg.includes('eat') || msg.includes('protein') || msg.includes('calories')) {
    const proteinTarget = Math.round(context.bodyweight * 2.2); // 2.2g per kg
    const calorieTarget = context.goal === 'muscle_gain' ? 2800 : context.goal === 'fat_loss' ? 2000 : 2400;
    
    return `Hey ${context.name}! Based on your ${context.bodyweight}kg bodyweight and ${context.goal} goal, here's what I recommend:\n\n🎯 Daily Targets:\n• Protein: ${proteinTarget}g (prioritize this!)\n• Calories: ~${calorieTarget} kcal\n• Carbs: Time them around workouts\n• Fats: 0.8-1g per kg bodyweight\n\nYour recent average is ${context.avgCalories} calories. ${context.avgCalories < calorieTarget - 300 ? 'You might need to eat more to support your training!' : context.avgCalories > calorieTarget + 300 ? 'Consider reducing slightly if fat loss is the goal.' : 'You\'re right on track! 👍'}`;
  }

  // Progress/motivation
  if (msg.includes('progress') || msg.includes('motivation') || msg.includes('help') || msg.includes('stuck')) {
    return `Listen ${context.name}, you've logged ${context.totalWorkouts} workouts - that's dedication! 🔥 Remember:\n\n✅ Consistency > Perfection\n✅ Progressive overload is key\n✅ Recovery is when you grow\n✅ Nutrition fuels your gains\n\nYou're ${context.trainingAge} years into training. The journey never ends, but every rep counts. What specific area do you want to improve? I'm here to help! 💪`;
  }

  // Recovery
  if (msg.includes('recovery') || msg.includes('rest') || msg.includes('sleep') || msg.includes('sore')) {
    return `Recovery is crucial, ${context.name}! Here's what you need:\n\n😴 Sleep: 7-9 hours minimum\n💧 Hydration: 3-4L water daily\n🍖 Protein: ${Math.round(context.bodyweight * 2.2)}g for muscle repair\n🧘 Active recovery: Light cardio, stretching\n\nIf you're feeling beat up, take a deload week (50-60% volume). Your muscles grow during rest, not in the gym. Listen to your body! 🎯`;
  }

  // Strength Index / PRs
  if (msg.includes('strength') || msg.includes('pr') || msg.includes('personal record') || msg.includes('stronger')) {
    return `Want to get stronger? Here's the blueprint:\n\n1️⃣ Progressive Overload: Add weight or reps each week\n2️⃣ Compound Movements: Squat, Bench, Deadlift, OHP\n3️⃣ Proper Form: Quality > Quantity always\n4️⃣ Adequate Recovery: Train hard, rest harder\n5️⃣ Fuel Your Body: ${Math.round(context.bodyweight * 2.2)}g protein daily\n\nWith ${context.totalWorkouts} workouts under your belt, you're building a solid foundation. Keep pushing! 💪`;
  }

  // Default response
  return `Hey ${context.name}! I'm your AI coach, here to help with:\n\n💪 Workout programming\n🍖 Nutrition advice\n📈 Progress tracking\n🎯 Goal setting\n💤 Recovery optimization\n\nYou've got ${context.totalWorkouts} workouts logged and you're working towards ${context.goal}. What would you like to know? Ask me about workouts, nutrition, progress, or anything fitness-related! 🦖`;
}

function getSuggestedMuscleGroups(trained: string[]): string {
  const allGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const untrained = allGroups.filter(g => !trained.includes(g));
  
  if (untrained.length === 0) return 'active recovery or a different training split';
  
  return untrained.slice(0, 2).join(' and ');
}
