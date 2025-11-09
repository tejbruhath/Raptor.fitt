import mongoose, { Schema, models } from 'mongoose';

export interface IMicroHabit {
  name: string;
  completed: boolean;
}

export interface IDailyCheckIn {
  _id: string;
  userId: string;
  date: Date;
  feeling: 'great' | 'good' | 'okay' | 'tired' | 'exhausted';
  mood: number; // 1-10
  energy: number; // 1-10
  motivation: number; // 1-10
  waterIntake: boolean;
  habits: IMicroHabit[];
  notes?: string;
  createdAt: Date;
}

const MicroHabitSchema = new Schema<IMicroHabit>({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: false });

const DailyCheckInSchema = new Schema<IDailyCheckIn>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  feeling: { type: String, enum: ['great', 'good', 'okay', 'tired', 'exhausted'], required: true },
  mood: { type: Number, required: true, min: 1, max: 10 },
  energy: { type: Number, required: true, min: 1, max: 10 },
  motivation: { type: Number, required: true, min: 1, max: 10 },
  waterIntake: { type: Boolean, default: false },
  habits: [MicroHabitSchema],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

DailyCheckInSchema.index({ userId: 1, date: -1 });

export default models.DailyCheckIn || mongoose.model<IDailyCheckIn>('DailyCheckIn', DailyCheckInSchema);
