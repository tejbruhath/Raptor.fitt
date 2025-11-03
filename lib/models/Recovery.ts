import mongoose, { Schema, models } from 'mongoose';

export interface IRecovery {
  _id: string;
  userId: string;
  date: Date;
  sleepHours: number;
  sleepQuality: number; // 1-10
  soreness: number; // 1-10
  stress: number; // 1-10
  notes?: string;
  createdAt: Date;
}

const RecoverySchema = new Schema<IRecovery>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  sleepHours: { type: Number, required: true },
  sleepQuality: { type: Number, required: true, min: 1, max: 10 },
  soreness: { type: Number, required: true, min: 1, max: 10 },
  stress: { type: Number, required: true, min: 1, max: 10 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

RecoverySchema.index({ userId: 1, date: -1 });

export default models.Recovery || mongoose.model<IRecovery>('Recovery', RecoverySchema);
