import mongoose, { Schema, models } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  image?: string;
  bodyweight: number[];
  trainingAge: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance';
  recoveryType: 'fast' | 'moderate' | 'slow';
  streakDays: number;
  lastActive: Date;
  onboarded?: boolean;
  settings: {
    theme: string;
    units: 'metric' | 'imperial';
    openaiApiKey?: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  image: { type: String },
  bodyweight: { type: [Number], default: [] },
  trainingAge: { type: Number, default: 0 },
  height: { type: Number, default: 170 },
  age: { type: Number, default: 25 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  goal: { type: String, enum: ['muscle_gain', 'fat_loss', 'strength', 'endurance'], default: 'strength' },
  recoveryType: { type: String, enum: ['fast', 'moderate', 'slow'], default: 'moderate' },
  streakDays: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  onboarded: { type: Boolean, default: false },
  settings: {
    theme: { type: String, default: 'dark' },
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    openaiApiKey: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || mongoose.model<IUser>('User', UserSchema);
