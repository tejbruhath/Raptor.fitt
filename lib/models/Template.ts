import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  exercises: [{
    name: String,
    muscleGroup: String,
    sets: [{
      reps: Number,
      weight: Number,
      rpe: Number,
    }],
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
