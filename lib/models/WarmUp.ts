import mongoose, { Schema, models } from 'mongoose';

export interface IWarmUpExercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in seconds
  notes?: string;
}

export interface IWarmUpRoutine {
  _id: string;
  userId: string;
  targetMuscles: string[];
  exercises: IWarmUpExercise[];
  totalDuration: number; // in seconds
  createdAt: Date;
  lastUsed: Date;
}

const WarmUpExerciseSchema = new Schema<IWarmUpExercise>({
  name: { type: String, required: true },
  sets: { type: Number, default: 1 },
  reps: { type: Number, default: 10 },
  duration: { type: Number },
  notes: { type: String },
}, { _id: false });

const WarmUpRoutineSchema = new Schema<IWarmUpRoutine>({
  userId: { type: String, required: true, index: true },
  targetMuscles: [{ type: String, required: true }],
  exercises: [WarmUpExerciseSchema],
  totalDuration: { type: Number, default: 300 },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: Date.now },
});

WarmUpRoutineSchema.index({ userId: 1, targetMuscles: 1 });

export default models.WarmUpRoutine || mongoose.model<IWarmUpRoutine>('WarmUpRoutine', WarmUpRoutineSchema);
