import mongoose, { Schema, models } from 'mongoose';

export interface IStrengthBreakdown {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
}

export interface IStrengthIndex {
  _id: string;
  userId: string;
  date: Date;
  totalSI: number;
  breakdown: IStrengthBreakdown;
  change: number;
  changePercent: number;
  createdAt: Date;
}

const StrengthIndexSchema = new Schema<IStrengthIndex>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  totalSI: { type: Number, required: true },
  breakdown: {
    chest: { type: Number, default: 0 },
    back: { type: Number, default: 0 },
    legs: { type: Number, default: 0 },
    shoulders: { type: Number, default: 0 },
    arms: { type: Number, default: 0 },
  },
  change: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

StrengthIndexSchema.index({ userId: 1, date: -1 });

export default models.StrengthIndex || mongoose.model<IStrengthIndex>('StrengthIndex', StrengthIndexSchema);
