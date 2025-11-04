import mongoose from 'mongoose';

const WorkoutPRSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  exerciseName: {
    type: String,
    required: true,
  },
  maxWeight: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  estimated1RM: {
    type: Number,
  },
  achievedAt: {
    type: Date,
    default: Date.now,
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
  },
}, {
  timestamps: true,
});

// Compound index for user + exercise
WorkoutPRSchema.index({ userId: 1, exerciseName: 1 });

// Index for sorting by date
WorkoutPRSchema.index({ userId: 1, achievedAt: -1 });

export default mongoose.models.WorkoutPR || mongoose.model('WorkoutPR', WorkoutPRSchema);
