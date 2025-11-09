import mongoose, { Schema, models } from 'mongoose';

export interface IBodyPhoto {
  url: string;
  publicId: string; // Cloudinary public ID
  view: 'front' | 'side' | 'back';
  uploadedAt: Date;
}

export interface IBodyEntry {
  _id: string;
  userId: string;
  date: Date;
  weight: number;
  bodyFat?: number;
  measurements: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
    calves?: number;
    shoulders?: number;
  };
  photos: IBodyPhoto[];
  notes?: string;
  createdAt: Date;
}

const BodyPhotoSchema = new Schema<IBodyPhoto>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  view: { type: String, enum: ['front', 'side', 'back'], required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const BodyTrackingSchema = new Schema<IBodyEntry>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  weight: { type: Number, required: true },
  bodyFat: { type: Number },
  measurements: {
    chest: { type: Number },
    waist: { type: Number },
    arms: { type: Number },
    thighs: { type: Number },
    calves: { type: Number },
    shoulders: { type: Number },
  },
  photos: [BodyPhotoSchema],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

BodyTrackingSchema.index({ userId: 1, date: -1 });

export default models.BodyTracking || mongoose.model<IBodyEntry>('BodyTracking', BodyTrackingSchema);
