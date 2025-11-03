import mongoose, { Schema, models } from 'mongoose';

export interface ISet {
  reps: number;
  weight: number;
  rpe?: number;
  timestamp: Date;
}

export interface IExercise {
  name: string;
  muscleGroup: string;
  sets: ISet[];
  notes?: string;
}

export interface IWorkout {
  _id: string;
  userId: string;
  date: Date;
  exercises: IExercise[];
  notes?: string;
  duration?: number;
  createdAt: Date;
}

const SetSchema = new Schema<ISet>({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  rpe: { type: Number, min: 1, max: 10 },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  sets: [SetSchema],
  notes: { type: String },
}, { _id: false });

const WorkoutSchema = new Schema<IWorkout>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  exercises: [ExerciseSchema],
  notes: { type: String },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

WorkoutSchema.index({ userId: 1, date: -1 });

export default models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);
