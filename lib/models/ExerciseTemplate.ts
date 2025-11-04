import mongoose from 'mongoose';

const ExerciseTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  muscleGroup: {
    type: String,
    required: true,
  },
  lastWeight: {
    type: Number,
    default: 0,
  },
  lastReps: {
    type: Number,
    default: 0,
  },
  lastSets: {
    type: Number,
    default: 0,
  },
  suggestedWeight: {
    type: Number,
  },
  timesLogged: {
    type: Number,
    default: 0,
  },
  lastLoggedAt: {
    type: Date,
  },
  avgVolume: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for user + exercise name
ExerciseTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

// Index for sorting by last logged
ExerciseTemplateSchema.index({ userId: 1, lastLoggedAt: -1 });

export default mongoose.models.ExerciseTemplate || mongoose.model('ExerciseTemplate', ExerciseTemplateSchema);
