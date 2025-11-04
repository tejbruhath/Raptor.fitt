import { z } from 'zod';

// User validation
export const userIdSchema = z.string().min(24).max(24); // MongoDB ObjectId length

// Workout validation
export const workoutSetSchema = z.object({
  reps: z.number().int().min(1).max(1000),
  weight: z.number().min(0).max(1000),
  rpe: z.number().min(1).max(10).optional(),
  isPR: z.boolean().optional(),
});

export const workoutExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.string().min(1).max(50),
  sets: z.array(workoutSetSchema).min(1).max(100),
});

export const workoutSchema = z.object({
  userId: userIdSchema,
  date: z.string().datetime().or(z.date()),
  exercises: z.array(workoutExerciseSchema).min(1).max(50),
  notes: z.string().max(5000).optional(),
  duration: z.number().min(0).max(86400).optional(), // max 24 hours in seconds
});

// Nutrition validation
export const nutritionMealSchema = z.object({
  name: z.string().min(1).max(200),
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fats: z.number().min(0).max(1000).optional(),
  time: z.string().optional(),
});

export const nutritionSchema = z.object({
  userId: userIdSchema,
  date: z.string().datetime().or(z.date()),
  meals: z.array(nutritionMealSchema).max(50),
  waterIntake: z.number().min(0).max(20).optional(), // liters
});

// Recovery validation
export const recoverySchema = z.object({
  userId: userIdSchema,
  date: z.string().datetime().or(z.date()),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().int().min(1).max(5),
  soreness: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  readiness: z.number().int().min(1).max(5).optional(),
});

// AI query validation
export const aiQuerySchema = z.object({
  userId: userIdSchema,
  query: z.string().min(1).max(5000),
});

// Generic sanitize helper
export function sanitizeString(str: string, maxLength: number = 5000): string {
  return str.slice(0, maxLength).trim();
}

export function sanitizeHtml(html: string): string {
  // Remove all HTML tags and dangerous characters
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}
