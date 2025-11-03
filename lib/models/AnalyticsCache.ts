import mongoose from 'mongoose';

/**
 * Analytics Cache Model
 * Stores pre-calculated analytics data to reduce client-side computation
 */

const AnalyticsCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Growth Prediction Data (cached)
  growthPrediction: {
    predicted: [{ date: Date, value: Number }],
    observed: [{ date: Date, value: Number }],
    future: [{ date: Date, value: Number }],
    currentSI: Number,
    projectedSI: Number,
    averageWeeklyGrowth: Number,
    dataPoints: Number,
  },
  
  // Volume Analytics (cached)
  volumeAnalytics: {
    weeklyAverage: Number,
    monthlyTotal: Number,
    byMuscleGroup: [{
      group: String,
      volume: Number,
      percentage: Number,
    }],
    byExercise: [{
      exercise: String,
      volume: Number,
      sets: Number,
      max1RM: Number,
    }],
  },
  
  // Strength Metrics (cached)
  strengthMetrics: {
    overallSI: Number,
    siHistory: [{ date: Date, value: Number }],
    exerciseMaxes: [{
      exercise: String,
      max1RM: Number,
      date: Date,
    }],
    strengthTrend: String, // 'increasing', 'stable', 'decreasing'
  },
  
  // Body Composition (cached)
  bodyComposition: {
    current: {
      weight: Number,
      measurements: {
        chest: Number,
        waist: Number,
        arms: Number,
        thighs: Number,
        calves: Number,
        shoulders: Number,
      },
      date: Date,
    },
    history: [{
      weight: Number,
      date: Date,
    }],
  },
  
  // Workout Streaks (cached)
  streaks: {
    current: Number,
    longest: Number,
    workoutDates: [Date],
  },
  
  // Achievements Progress (cached)
  achievementsProgress: {
    totalUnlocked: Number,
    totalPRs: Number,
    completionPercentage: Number,
    recentUnlocks: [{
      achievementId: String,
      unlockedAt: Date,
    }],
  },
  
  // Muscle Balance Score (cached)
  muscleBalance: {
    score: Number, // 0-100
    distribution: [{
      muscleGroup: String,
      percentage: Number,
      color: String,
    }],
    recommendations: [String],
  },
  
  // Last Updated
  lastCalculated: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Cache Validity (refresh after 1 hour)
  validUntil: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    index: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
AnalyticsCacheSchema.index({ userId: 1, lastCalculated: -1 });

// Method to check if cache is still valid
AnalyticsCacheSchema.methods.isValid = function() {
  return new Date() < this.validUntil;
};

const AnalyticsCache = mongoose.models.AnalyticsCache || mongoose.model('AnalyticsCache', AnalyticsCacheSchema);

export default AnalyticsCache;
