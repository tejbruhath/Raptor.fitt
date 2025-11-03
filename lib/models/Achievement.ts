import mongoose from 'mongoose';

export { ACHIEVEMENTS } from '@/lib/constants/achievements';

export interface IAchievement extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  title: string;
  description: string;
  category: 'strength' | 'consistency' | 'volume' | 'milestone' | 'social' | 'pr';
  icon: string;
  unlockedAt: Date;
  progress?: number;
  target?: number;
  // PR-specific fields
  isPR?: boolean;
  exerciseName?: string;
  weight?: number;
  reps?: number;
  muscleGroup?: string;
}

const AchievementSchema = new mongoose.Schema<IAchievement>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['strength', 'consistency', 'volume', 'milestone', 'social', 'pr'],
      required: true,
    },
    icon: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number },
    target: { type: Number },
    // PR-specific fields
    isPR: { type: Boolean, default: false },
    exerciseName: { type: String },
    weight: { type: Number },
    reps: { type: Number },
    muscleGroup: { type: String },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
AchievementSchema.index({ userId: 1, unlockedAt: -1 });

const AchievementModel = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default AchievementModel;
