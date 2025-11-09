import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use Gemini 2.5 Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export interface ParsedWorkoutLog {
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
  rpe?: number;
  muscleGroup?: string;
}

export interface ParsedNutritionLog {
  foodName: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface AIInsightResponse {
  title: string;
  message: string;
  type: 'strength' | 'recovery' | 'nutrition' | 'general';
  priority: 'low' | 'medium' | 'high';
}

/**
 * Parse workout input from text or voice
 * Examples: "bench 80 3 10", "squat 100kg 5x5", "deadlift 150 for 5 reps"
 */
export async function parseWorkoutInput(input: string): Promise<ParsedWorkoutLog | null> {
  try {
    const prompt = `Parse this workout log input into structured data. Extract exercise name, weight (in kg), number of sets, and reps per set. If RPE is mentioned (1-10), include it. Return ONLY valid JSON with this exact structure:
{
  "exercise": "exercise name",
  "weight": number,
  "sets": number,
  "reps": number,
  "rpe": number or null,
  "muscleGroup": "muscle group" or null
}

Input: "${input}"

Return JSON only, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.exercise || !parsed.weight || !parsed.sets || !parsed.reps) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse workout input:', error);
    return null;
  }
}

/**
 * Parse nutrition input from text or voice
 * Examples: "chicken 200g", "rice 150", "protein shake 300ml"
 */
export async function parseNutritionInput(input: string): Promise<ParsedNutritionLog | null> {
  try {
    const prompt = `Parse this food log input. Extract food name, quantity, and unit. If it's a common food, estimate macros (calories, protein, carbs, fats). Return ONLY valid JSON with this structure:
{
  "foodName": "food name",
  "quantity": number,
  "unit": "g/ml/oz/cups/etc",
  "calories": number or null,
  "protein": number or null,
  "carbs": number or null,
  "fats": number or null
}

Input: "${input}"

Return JSON only, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.foodName || !parsed.quantity || !parsed.unit) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse nutrition input:', error);
    return null;
  }
}

/**
 * Generate daily summary based on user data
 */
export async function generateDailySummary(data: {
  workouts: any[];
  nutrition: any;
  sleep: any;
  recovery: any;
}): Promise<string> {
  try {
    const prompt = `You are Raptor, a hype fitness AI coach. Generate a brief, motivational daily summary (2-3 sentences max) based on this user data. Be energetic and encouraging. Use emojis sparingly.

Data:
- Workouts: ${data.workouts.length} sessions
- Nutrition: ${data.nutrition?.totalCalories || 0} calories
- Sleep: ${data.sleep?.hoursSlept || 0} hours
- Recovery Score: ${data.recovery?.score || 0}/100

Keep it short, hype, and actionable.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Failed to generate daily summary:', error);
    return "Keep crushing it! 💪";
  }
}

/**
 * Generate AI insights based on patterns
 */
export async function generateInsight(context: {
  type: 'strength' | 'recovery' | 'nutrition';
  data: any;
}): Promise<AIInsightResponse | null> {
  try {
    const prompt = `You are Raptor, an AI fitness coach. Analyze this ${context.type} data and provide ONE actionable insight. Return ONLY valid JSON with this structure:
{
  "title": "short title",
  "message": "brief message (1-2 sentences)",
  "type": "${context.type}",
  "priority": "low/medium/high"
}

Data: ${JSON.stringify(context.data)}

Return JSON only.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to generate insight:', error);
    return null;
  }
}

/**
 * Chat with Raptor AI
 */
export async function chatWithRaptor(
  message: string,
  personality: 'hype' | 'coach' | 'scientist',
  context?: any
): Promise<string> {
  try {
    let systemPrompt = '';
    
    switch (personality) {
      case 'hype':
        systemPrompt = 'You are Raptor, an energetic hype man fitness coach. Be enthusiastic, use emojis, and motivate the user. Keep responses brief (2-3 sentences).';
        break;
      case 'coach':
        systemPrompt = 'You are Raptor, a professional fitness coach. Be encouraging but professional. Focus on form, progress, and technique. Keep responses concise.';
        break;
      case 'scientist':
        systemPrompt = 'You are Raptor, a science-based fitness expert. Provide data-driven insights. Reference studies when relevant. Be precise and informative.';
        break;
    }
    
    const contextStr = context ? `\n\nContext: ${JSON.stringify(context)}` : '';
    const prompt = `${systemPrompt}\n\nUser: ${message}${contextStr}\n\nRaptor:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Chat with Raptor failed:', error);
    return "Sorry, I'm having trouble connecting right now. Let's crush it later! 💪";
  }
}

/**
 * Generate workout recommendations
 */
export async function generateWorkoutRecommendation(userData: {
  recentWorkouts: any[];
  recoveryScore: number;
  goal: string;
}): Promise<string> {
  try {
    const prompt = `Based on this user's recent activity, suggest their next workout. Be specific about exercises and volume. 2-3 sentences max.

Recent workouts: ${userData.recentWorkouts.length} sessions
Recovery score: ${userData.recoveryScore}/100
Goal: ${userData.goal}

Keep it actionable and motivating.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Failed to generate workout recommendation:', error);
    return 'Focus on compound movements and progressive overload. Listen to your body! 💪';
  }
}

/**
 * Analyze injury risk based on patterns
 */
export async function analyzeInjuryRisk(data: {
  recentWorkouts: any[];
  sleep: any[];
  soreness: number[];
}): Promise<{
  risk: 'low' | 'medium' | 'high';
  reason: string;
  recommendation: string;
}> {
  try {
    const prompt = `Analyze injury risk based on this data. Return ONLY valid JSON:
{
  "risk": "low/medium/high",
  "reason": "brief explanation",
  "recommendation": "what to do"
}

Data:
- Workouts: ${data.recentWorkouts.length} in past week
- Avg sleep: ${data.sleep.reduce((a, b) => a + (b.hoursSlept || 0), 0) / data.sleep.length || 0}h
- Avg soreness: ${data.soreness.reduce((a, b) => a + b, 0) / data.soreness.length || 0}/10

Return JSON only.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        risk: 'low',
        reason: 'Insufficient data',
        recommendation: 'Keep logging consistently',
      };
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to analyze injury risk:', error);
    return {
      risk: 'low',
      reason: 'Unable to analyze',
      recommendation: 'Listen to your body and rest when needed',
    };
  }
}
