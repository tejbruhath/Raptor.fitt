import mongoose, { Schema, models } from 'mongoose';

export interface IMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: Date;
  // Smart logging fields
  type?: 'smart' | 'manual';
  foodName?: string;
  quantity?: number;
  unit?: string;
  mealType?: string;
}

export interface INutrition {
  _id: string;
  userId: string;
  date: Date;
  meals: IMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  waterIntake?: number;
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  // Smart logging fields
  type: { type: String, enum: ['smart', 'manual'] },
  foodName: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  mealType: { type: String },
}, { _id: false });

const NutritionSchema = new Schema<INutrition>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  meals: [MealSchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFats: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

NutritionSchema.index({ userId: 1, date: -1 });

export default models.Nutrition || mongoose.model<INutrition>('Nutrition', NutritionSchema);
