import mongoose from 'mongoose';

// Follow relationship
export interface IFollow extends mongoose.Document {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new mongoose.Schema<IFollow>(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    followingId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1 });

export const Follow = mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);

// Activity Feed
export interface IActivity extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'workout' | 'achievement' | 'milestone' | 'pr';
  title: string;
  description: string;
  metadata: {
    workoutId?: mongoose.Types.ObjectId;
    achievementId?: string;
    value?: number;
    exercise?: string;
  };
  likes: mongoose.Types.ObjectId[];
  comments: {
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
}

const ActivitySchema = new mongoose.Schema<IActivity>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: {
      type: String,
      enum: ['workout', 'achievement', 'milestone', 'pr'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    metadata: {
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
      achievementId: String,
      value: Number,
      exercise: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ createdAt: -1 });

export const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

// Leaderboard entry
export interface ILeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  username: string;
  strengthIndex: number;
  rank: number;
  change: number;
  totalWorkouts: number;
  weeklyVolume: number;
}
