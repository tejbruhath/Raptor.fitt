import mongoose, { Schema, models } from 'mongoose';

export interface ICrewMember {
  userId: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  role: 'owner' | 'member';
}

export interface ICrew {
  _id: string;
  name: string;
  emoji?: string;
  ownerId: string;
  members: ICrewMember[];
  maxMembers: number;
  inviteCode: string;
  createdAt: Date;
  isActive: boolean;
}

const CrewMemberSchema = new Schema<ICrewMember>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  joinedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['owner', 'member'], default: 'member' },
}, { _id: false });

const CrewSchema = new Schema<ICrew>({
  name: { type: String, required: true },
  emoji: { type: String, default: '🦖' },
  ownerId: { type: String, required: true, index: true },
  members: [CrewMemberSchema],
  maxMembers: { type: Number, default: 5 },
  inviteCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

CrewSchema.index({ inviteCode: 1 });
CrewSchema.index({ 'members.userId': 1 });

export default models.Crew || mongoose.model<ICrew>('Crew', CrewSchema);
