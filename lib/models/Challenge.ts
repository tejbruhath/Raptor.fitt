import mongoose, { Schema, models } from 'mongoose';

export interface ILeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  lastUpdated: Date;
}

export interface IChallenge {
  _id: string;
  crewId: string;
  title: string;
  description: string;
  type: 'volume' | 'consistency' | 'prs' | 'custom';
  metric: string; // e.g., "total_reps", "workout_count", "pr_count"
  startDate: Date;
  endDate: Date;
  leaderboard: ILeaderboardEntry[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  score: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

const ChallengeSchema = new Schema<IChallenge>({
  crewId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['volume', 'consistency', 'prs', 'custom'], required: true },
  metric: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  leaderboard: [LeaderboardEntrySchema],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

ChallengeSchema.index({ crewId: 1, isActive: 1 });
ChallengeSchema.index({ startDate: 1, endDate: 1 });

export default models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);
